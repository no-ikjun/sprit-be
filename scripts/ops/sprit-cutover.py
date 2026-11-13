#!/usr/bin/env python3
"""Host-only staged sprit cutover. Secrets/data stay in the private directory.
Usage: stage | freeze-copy | import-preview | activate | status
No old database, volume, or original container is deleted.
"""
import os,sys,json,pathlib,subprocess,hashlib,gzip,time,datetime,urllib.request
os.umask(0o077)
B=pathlib.Path('/home/ubuntu/sprit-postgres-cutover-20261113')
PG='gistag-postgres-1'; OLD='sprit-mariadb-preserved-20261113'
FLAG='/run/sprit-maintenance.flag'; ARCHIVE_SHA='d73861125f1a2c737045dd1c82261466ef2e7dbed90e4b05d5983dd1ba44ba45'
REVISION='a91e431b324e3e8d3f3ed89671f64bf1ba970a3f'
def now():return datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=9))).isoformat()
def run(args,input=None):
 r=subprocess.run(args,input=input,text=True,capture_output=True)
 if r.returncode:
  (B/'last-error.private.log').write_text(r.stderr)
  raise RuntimeError('Command failed: '+args[0]+' (private error log saved)')
 return r.stdout
def save(name,value): (B/name).write_text(json.dumps(value,ensure_ascii=False,indent=2))
def sql(s,db='sprit'):return run(['docker','exec','-i',PG,'sh','-c','exec psql -X -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$1" -At','sh',db],s)
def healthy(port=3000):
 for _ in range(45):
  try:
   if urllib.request.urlopen(f'http://127.0.0.1:{port}/health',timeout=2).status==200:return
  except Exception:pass
  time.sleep(1)
 raise RuntimeError('Health check failed')
def exists(name):return subprocess.run(['docker','inspect',name],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL).returncode==0
def rollback_before_writes():
 if (B/'postgres-writes-enabled.json').exists():return
 if exists(OLD):
  if exists('sprit'):
   run(['docker','stop','-t','20','sprit']);run(['docker','rm','sprit'])
  run(['docker','rename',OLD,'sprit']);run(['docker','update','--restart=always','sprit']);run(['docker','start','sprit']);healthy()
 elif exists('sprit'):
  run(['docker','update','--restart=always','sprit']);run(['docker','start','sprit']);healthy()
 run(['sudo','rm','-f',FLAG]);save('rollback-before-writes.json',{'at':now()})
def image():return json.loads((B/'release.json').read_text())['runtimeImage']
def container_tool(script,report,migration=False,args=None,http=False):
 cmd=['docker','run','--rm','--user=0','--memory=256m','--network','gistag-net','--env-file',str(B/('migration.env' if migration else 'app.env')),'-v',str(B/'source-final.json')+':/run/source.json:ro','--entrypoint','node']
 if http:cmd+=['-e','PROBE_HTTP_URL=http://sprit:3000']
 cmd += [image(),'scripts/migration/'+script]+(args or [])+['/run/source.json']
 out=run(cmd);parsed=json.loads(out);save(report,parsed);return parsed
def stage():
 archive=B/'sprit-release-image.tar.gz'
 with archive.open('rb') as f:
  if hashlib.file_digest(f,'sha256').hexdigest()!=ARCHIVE_SHA:raise RuntimeError('Archive checksum mismatch')
 # The server runs Python 3.10; hashlib.file_digest is replaced below if needed.
 with gzip.open(archive,'rb') as src:
  p=subprocess.Popen(['docker','load'],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
  import shutil
  try:shutil.copyfileobj(src,p.stdin)
  finally:p.stdin.close()
  out=p.stdout.read();err=p.stderr.read();code=p.wait()
  if code:raise RuntimeError('Image load failed')
 meta=json.loads(run(['docker','image','inspect','sprit:pg-cutover-20261113']))[0]
 if meta['Architecture']!='amd64' or meta['Config']['Labels'].get('org.opencontainers.image.revision')!=REVISION:raise RuntimeError('Image identity mismatch')
 save('release.json',{'stagedAt':now(),'runtimeImage':meta['Id'],'sourceCommit':REVISION,'archiveSha256':ARCHIVE_SHA})
 print(json.dumps({'stage':'image-ready','image':meta['Id'],'revision':REVISION}),flush=True)
def freeze_copy():
 if (B/'source-final.json').exists() or (B/'postgres-writes-enabled.json').exists():raise RuntimeError('Final snapshot already exists')
 if exists(OLD):raise RuntimeError('Preserved source container already exists')
 healthy();healthy(3002)
 original=(B/'nginx-default.before').read_text()
 line='    server_name sprit-api.ikjun.com;'
 if original.count(line)!=2:raise RuntimeError('Unexpected nginx sprit server inventory')
 modified=original.replace(line,line+'\n    if (-f '+FLAG+') { return 503; } # sprit cutover guard')
 (B/'nginx-maintenance.conf').write_text(modified)
 destination=str(pathlib.Path('/etc/nginx/sites-enabled/default').resolve())
 run(['sudo','cp',str(B/'nginx-maintenance.conf'),destination])
 try:run(['sudo','nginx','-t'])
 except Exception:
  run(['sudo','cp',str(B/'nginx-default.before'),destination]);raise
 run(['sudo','systemctl','reload','nginx']);run(['sudo','touch',FLAG]);run(['sudo','chmod','644',FLAG])
 for attempt in range(5):
  status=run(['curl','--resolve','sprit-api.ikjun.com:443:127.0.0.1','-sS','-o','/dev/null','-w','%{http_code}','https://sprit-api.ikjun.com/health'])
  if status=='503':break
  time.sleep(1)
 else:raise RuntimeError('Public maintenance route did not return 503')
 save('freeze.json',{'maintenanceStartedAt':now(),'originalContainer':OLD})
 print('maintenance active; draining sprit requests',flush=True);time.sleep(10)
 run(['docker','update','--restart=no','sprit']);run(['docker','stop','-t','30','sprit']);run(['docker','rename','sprit',OLD])
 oldImage=json.loads((B/'original-container-inspect.json').read_text())['Image']
 source=['docker','run','--rm','--user=0','--memory=256m','--network','bridge','--env-file',str(B/'source.env')]
 data=run(source+['-i','--entrypoint','node',oldImage],(B/'export-mariadb.cjs').read_text())
 parsed=json.loads(data)
 (B/'source-final.json').write_text(data);os.chmod(B/'source-final.json',0o400)
 dump=run(source+['--entrypoint','sh',oldImage,'-c','export MYSQL_PWD="$DATABASE_PASSWORD"; exec mariadb-dump --host="$DATABASE_HOST" --port="$DATABASE_PORT" --user="$DATABASE_USER" --single-transaction --skip-lock-tables --hex-blob --routines --events --triggers "$DATABASE_NAME"'])
 with gzip.open(B/'mariadb-final.sql.gz','wb') as f:f.write(dump.encode())
 os.chmod(B/'mariadb-final.sql.gz',0o400)
 save('final-source-summary.json',{'capturedAt':parsed['capturedAt'],'tables':len(parsed['tables']),'rows':sum(len(t['rows']) for t in parsed['tables']),'sha256':hashlib.sha256(data.encode()).hexdigest()})
 print('source stopped; final JSON and SQL backups complete',flush=True)
def start_app(preview):
 cmd=['docker','run','-d','--name','sprit','--network','gistag-net','-p','127.0.0.1:3000:3000','--env-file',str(B/'app.env'),'--restart='+('no' if preview else 'always')]
 if preview:cmd+=['-e','REHEARSAL_MODE=true']
 run(cmd+[image()]);healthy()
def import_preview():
 if not pathlib.Path(FLAG).exists() or not exists(OLD):raise RuntimeError('Source must be frozen first')
 r=container_tool('migrate-postgres.cjs','final-load-report.json',True,['load'])
 sql('GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO sprit_app; ALTER DEFAULT PRIVILEGES FOR ROLE sprit_migrator IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO sprit_app;')
 start_app(True)
 container_tool('validate-release.cjs','production-preview-validation.json',http=True)
 container_tool('migrate-postgres.cjs','final-verify-report.json',True,['verify'])
 healthy(3002);save('preview-ready.json',{'at':now(),'rows':r['totalRows'],'loginChecks':r['loginChecks'],'searchChecks':r['searchChecks']})
 print(json.dumps({'stage':'preview-verified','rows':r['totalRows'],'loginChecks':r['loginChecks'],'searchChecks':r['searchChecks']}),flush=True)
def activate():
 if not (B/'preview-ready.json').exists() or not pathlib.Path(FLAG).exists():raise RuntimeError('Verified preview required')
 if (B/'postgres-writes-enabled.json').exists():raise RuntimeError('Already activated')
 run(['docker','stop','-t','30','sprit']);run(['docker','rm','sprit'])
 # From this point scheduler/application writes can occur: never auto-fallback.
 save('postgres-writes-enabled.json',{'at':now(),'rollback':'PostgreSQL recovery/reconciliation required'})
 start_app(False)
 healthy(3002)
 import shutil
 shutil.copyfile(B/'app.env','/home/ubuntu/sprit.env');os.chmod('/home/ubuntu/sprit.env',0o600)
 sql('ALTER ROLE sprit_migrator NOLOGIN;')
 run(['sudo','rm',FLAG]);save('activated.json',{'at':now(),'image':image(),'sourceCommit':REVISION,'database':'sprit','appRole':'sprit_app'})
 print(json.dumps({'stage':'activated','at':now(),'image':image()}),flush=True)
if not hasattr(hashlib,'file_digest'):
 def file_digest(f,algorithm):
  h=hashlib.new(algorithm)
  for chunk in iter(lambda:f.read(1024*1024),b''):h.update(chunk)
  return h
 hashlib.file_digest=file_digest
try:
 mode=sys.argv[1]
 {'stage':stage,'freeze-copy':freeze_copy,'import-preview':import_preview,'activate':activate,'status':lambda:print((B/'activated.json').read_text())}[mode]()
except Exception as e:
 if len(sys.argv)>1 and sys.argv[1] in ['freeze-copy','import-preview']:
  try:rollback_before_writes()
  except Exception:print('Rollback needs attention; maintenance flag retained',file=sys.stderr)
 print(type(e).__name__+': '+str(e),file=sys.stderr);sys.exit(1)
