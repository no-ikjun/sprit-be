'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { Client } = require('pg');
const [snapshotFile] = process.argv.slice(2);
const target = process.env.PGDATABASE;
if (
  !/^sprit_rehearsal_guard_/.test(target || '') ||
  !process.env.PGHOST?.startsWith('/') ||
  process.env.MIGRATION_TARGET_DATABASE !== target
)
  throw Error('Explicit isolated guard-test database required');
const invoke = (mode, file, overrides = {}) =>
  spawnSync(
    process.execPath,
    [path.join(__dirname, 'migrate-postgres.cjs'), mode, file],
    { env: { ...process.env, ...overrides }, encoding: 'utf8' },
  );
const requireResult = (r, ok, label) => {
  if ((r.status === 0) !== ok) throw Error(label);
};
async function main() {
  const report = [];
  requireResult(
    invoke('load', snapshotFile, { MIGRATION_TARGET_DATABASE: 'arrive' }),
    false,
    'wrong target unexpectedly accepted',
  );
  report.push('mismatched target refused');
  requireResult(
    invoke('load', snapshotFile, { PGHOST: 'not-a-local-host' }),
    false,
    'remote target unexpectedly accepted',
  );
  report.push('remote target refused by default');
  const bad = JSON.parse(fs.readFileSync(snapshotFile));
  bad.tables.find((t) => t.TABLE_NAME === 'article').rows[0].book_uuid =
    '__missing_parent_for_guard_test__';
  const invalidFile = path.join(
    path.dirname(snapshotFile),
    'invalid-fk-guard-' + process.pid + '.json',
  );
  try {
    fs.writeFileSync(invalidFile, JSON.stringify(bad), {
      flag: 'wx',
      mode: 0o600,
    });
    const result = invoke('load', invalidFile);
    requireResult(result, false, 'invalid FK unexpectedly accepted');
    if (!result.stderr.includes('23503'))
      throw Error('expected FK failure not observed');
    const db = new Client();
    await db.connect();
    try {
      if (
        (
          await db.query(
            "SELECT count(*)::int AS n FROM pg_tables WHERE schemaname='public'",
          )
        ).rows[0].n !== 0
      )
        throw Error('failed import left tables');
    } finally {
      await db.end();
    }
    report.push('invalid FK rolled back all DDL/data');
  } finally {
    fs.unlinkSync(invalidFile);
  }
  requireResult(
    invoke('load', snapshotFile),
    true,
    'retry into rolled-back empty target failed',
  );
  report.push('retry after failed transaction passed');
  requireResult(
    invoke('load', snapshotFile),
    false,
    'nonempty target unexpectedly accepted',
  );
  report.push('nonempty target refused');
  requireResult(
    invoke('verify', snapshotFile),
    true,
    'verification after refusal failed',
  );
  report.push('existing data unchanged after refusal');
  console.log(
    JSON.stringify({ passed: report.length, checks: report }, null, 2),
  );
}
main().catch((e) => {
  console.error('Guard test failed:', e.code || e.message);
  process.exitCode = 1;
});
