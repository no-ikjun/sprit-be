import os,json,secrets,subprocess,pathlib
os.umask(0o077)
base=pathlib.Path('/home/ubuntu/sprit-postgres-cutover-20261113')
if base.exists(): raise SystemExit('Preparation directory already exists; inspect before retry')
base.mkdir(mode=0o700)
pg='gistag-postgres-1'
def run(args,input=None):
 r=subprocess.run(args,input=input,text=True,capture_output=True)
 if r.returncode:
  (base/'prepare-error.log').write_text(r.stderr)
  raise RuntimeError('Command failed; private log saved')
 return r.stdout
def sql(statement,db='postgres'):
 return run(['docker','exec','-i',pg,'sh','-c','exec psql -X -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$1" -At','sh',db],statement)
original=json.loads(run(['docker','inspect','sprit']))[0]
(base/'original-container-inspect.json').write_text(json.dumps(original))
env=dict(item.split('=',1) for item in original['Config']['Env'])
if any('\n' in v or '\r' in v for v in env.values()): raise RuntimeError('Multiline Docker env requires explicit encoding')
def envfile(name,values): (base/name).write_text(''.join(k+'='+v+'\n' for k,v in values.items()))
envfile('source.env',env)
(base/'nginx-default.before').write_text(pathlib.Path('/etc/nginx/sites-enabled/default').read_text())
if sql("SELECT count(*) FROM pg_database WHERE datname='sprit'").strip()!='0': raise RuntimeError('Target database exists')
if sql("SELECT count(*) FROM pg_roles WHERE rolname IN ('sprit_app','sprit_migrator')").strip()!='0': raise RuntimeError('Target roles exist')
appPassword=secrets.token_urlsafe(36); migratorPassword=secrets.token_urlsafe(36)
sql("SET password_encryption='scram-sha-256'; CREATE ROLE sprit_migrator LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION PASSWORD '"+migratorPassword+"'; CREATE ROLE sprit_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION PASSWORD '"+appPassword+"'; CREATE DATABASE sprit OWNER sprit_migrator TEMPLATE template0 ENCODING 'UTF8'; REVOKE ALL ON DATABASE sprit FROM PUBLIC; GRANT CONNECT ON DATABASE sprit TO sprit_app;")
sql("REVOKE ALL ON SCHEMA public FROM PUBLIC; GRANT USAGE ON SCHEMA public TO sprit_app; ALTER ROLE sprit_app IN DATABASE sprit SET timezone TO 'Asia/Seoul';",'sprit')
env.update(DATABASE_TYPE='postgres',DATABASE_HOST=pg,DATABASE_PORT='5432',DATABASE_NAME='sprit',DATABASE_USER='sprit_app',DATABASE_PASSWORD=appPassword,TZ='Asia/Seoul',NODE_ENV='production')
env.pop('REHEARSAL_MODE',None);envfile('app.env',env)
envfile('migration.env',dict(PGHOST=pg,PGPORT='5432',PGDATABASE='sprit',PGUSER='sprit_migrator',PGPASSWORD=migratorPassword,MIGRATION_TARGET_DATABASE='sprit',MIGRATION_ALLOW_REMOTE='true',TZ='Asia/Seoul'))
hba=run(['docker','exec',pg,'cat','/var/lib/postgresql/data/pg_hba.conf'])
(base/'pg_hba.before.conf').write_text(hba)
rules='# sprit dedicated roles: no access to arrive/gistag/other databases\n'
for role in ['sprit_app','sprit_migrator']:
 rules+=f'host sprit {role} 172.20.0.0/16 scram-sha-256\nhost all {role} 0.0.0.0/0 reject\nhost all {role} ::0/0 reject\nlocal all {role} reject\n'
def write_hba(text):run(['docker','exec','-i',pg,'sh','-c','cat > /var/lib/postgresql/data/pg_hba.conf.sprit-new && chown postgres:postgres /var/lib/postgresql/data/pg_hba.conf.sprit-new && chmod 600 /var/lib/postgresql/data/pg_hba.conf.sprit-new && mv /var/lib/postgresql/data/pg_hba.conf.sprit-new /var/lib/postgresql/data/pg_hba.conf'],text)
write_hba(rules+hba)
if sql('SELECT count(*) FROM pg_hba_file_rules WHERE error IS NOT NULL').strip()!='0':
 write_hba(hba);raise RuntimeError('HBA validation failed; original restored')
sql('SELECT pg_reload_conf()')
def auth_probe(db):
 return subprocess.run(['docker','exec','-i',pg,'sh','-c','IFS= read -r PGPASSWORD; export PGPASSWORD; exec psql -X -h gistag-postgres-1 -U sprit_app -d "$1" -Atc "SELECT 1"','sh',db],input=appPassword+'\n',text=True,capture_output=True).returncode
if auth_probe('sprit')!=0 or auth_probe('arrive')==0 or auth_probe('gistag')==0:raise RuntimeError('Role isolation check failed')
summary={'database':'sprit','appRole':'sprit_app','migrationRole':'sprit_migrator','hbaIsolation':'sprit only; arrive/gistag rejected','oldImage':original['Image']}
(base/'preparation-summary.json').write_text(json.dumps(summary,indent=2));print(json.dumps(summary))
