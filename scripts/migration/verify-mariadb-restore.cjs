'use strict';
const fs = require('node:fs');
const cp = require('node:child_process');
const [file, container] = process.argv.slice(2);
if (!/^sprit-mariadb-rehearsal-[a-z0-9-]+$/.test(container || ''))
  throw Error('Explicit rehearsal container required');
const q = (s) => '`' + s.replace(/`/g, '``') + '`';
const query = (sql) =>
  cp.execFileSync(
    'docker',
    [
      'exec',
      container,
      'mariadb',
      '-uroot',
      '-N',
      '-B',
      '--raw',
      'sprit',
      '-e',
      sql,
    ],
    {
      maxBuffer: 30 * 1024 * 1024,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
try {
  const network = cp
    .execFileSync(
      'docker',
      ['inspect', '--format', '{{.HostConfig.NetworkMode}}', container],
      { encoding: 'utf8' },
    )
    .trim();
  if (network !== 'none') throw Error('Restore container must have no network');
  const s = JSON.parse(fs.readFileSync(file));
  const report = [];
  for (const t of s.tables) {
    const columns = t.columns.map(
      (c) =>
        `IF(${q(c.COLUMN_NAME)} IS NULL,'N',CONCAT('V',HEX(CAST(${q(
          c.COLUMN_NAME,
        )} AS BINARY))))`,
    );
    const raw = query(
      'SELECT ' + columns.join(',') + ' FROM ' + q(t.TABLE_NAME),
    );
    const rows = raw
      .trimEnd()
      .split('\n')
      .filter(Boolean)
      .map((l) =>
        l.split('\t').map((v, i) => {
          if (v === 'N') return null;
          const x = Buffer.from(v.slice(1), 'hex').toString('utf8');
          return ['int', 'tinyint', 'double'].includes(t.columns[i].DATA_TYPE)
            ? Number(x)
            : x;
        }),
      );
    const pk = t.columns.findIndex((c) => c.COLUMN_KEY === 'PRI');
    const byId = new Map(rows.map((r) => [r[pk], r]));
    let differences = 0,
      floatingPointDifferences = 0,
      maxRelativeError = 0;
    if (rows.length !== t.rows.length) throw Error('Row count mismatch');
    for (const expected of t.rows) {
      const actual = byId.get(expected[t.columns[pk].COLUMN_NAME]);
      if (!actual) throw Error('Missing primary key');
      t.columns.forEach((c, i) => {
        const a = actual[i],
          e = expected[c.COLUMN_NAME];
        if (a === e) return;
        if (c.DATA_TYPE === 'double' && a !== null && e !== null) {
          const error = Math.abs(a - e) / Math.max(1, Math.abs(e));
          maxRelativeError = Math.max(maxRelativeError, error);
          if (error < 1e-14) {
            floatingPointDifferences++;
            return;
          }
        }
        differences++;
      });
    }
    report.push({
      table: t.TABLE_NAME,
      rows: rows.length,
      differences,
      floatingPointDifferences,
      maxRelativeError,
    });
  }
  console.log(
    JSON.stringify(
      {
        tables: report,
        exact: report.every(
          (t) => t.differences === 0 && t.floatingPointDifferences === 0,
        ),
      },
      null,
      2,
    ),
  );
  if (report.some((t) => t.differences)) process.exitCode = 1;
} catch (e) {
  console.error('Restore verification failed:', e.code || e.message);
  process.exitCode = 1;
}
