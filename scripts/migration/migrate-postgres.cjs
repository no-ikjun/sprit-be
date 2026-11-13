'use strict';
// This is a fail-closed importer for the observed sprit schema, not a generic
// MySQL converter. Unsupported schema changes require review before cutover.
const fs = require('node:fs');
const crypto = require('node:crypto');
const { Client, types } = require('pg');
types.setTypeParser(1114, (s) => s); // Preserve all microseconds for verification.
const q = (s) => '"' + s.replace(/"/g, '""') + '"';
const lit = (s) => "'" + s.replace(/'/g, "''") + "'";
const hash = (x) => crypto.createHash('sha256').update(x).digest('hex');
const generated = new Set([
  'article_like.article_like_uuid',
  'profile.profile_uuid',
  'profile_recommend_book.recommend_uuid',
  'user_follow.follow_uuid',
]);
function group(rows, key) {
  return Object.values(
    rows.reduce((a, r) => {
      (a[r[key]] ||= []).push(r);
      return a;
    }, {}),
  );
}
function pgType(c) {
  if (c.EXTRA || c.GENERATION_EXPRESSION)
    throw Error('Unsupported generated column');
  if (c.COLUMN_TYPE === 'tinyint(1)') return 'boolean';
  if (c.COLUMN_TYPE === 'int(11)') return 'integer';
  if (c.COLUMN_TYPE === 'double') return 'double precision';
  if (c.DATA_TYPE === 'datetime')
    return `timestamp(${Number(c.DATETIME_PRECISION || 0)}) without time zone`;
  if (c.COLUMN_TYPE === 'varchar(255)' || c.COLUMN_TYPE === 'text') {
    if (c.COLLATION_NAME !== 'utf8mb3_general_ci')
      throw Error('Unreviewed source collation');
    return (
      (c.DATA_TYPE === 'text' ? 'text' : 'varchar(255)') + ' COLLATE sprit_ci'
    );
  }
  throw Error('Unsupported column type');
}
function defaultSql(t, c) {
  if (generated.has(t.TABLE_NAME + '.' + c.COLUMN_NAME))
    return ' DEFAULT gen_random_uuid()::text';
  const d = c.COLUMN_DEFAULT;
  if (d === null || d === 'NULL') return '';
  if (/^current_timestamp\(\)$/i.test(d)) return ' DEFAULT CURRENT_TIMESTAMP';
  if (c.COLUMN_TYPE === 'tinyint(1)' && /^[01]$/.test(d))
    return ` DEFAULT ${d === '1' ? 'true' : 'false'}`;
  if (/^-?\d+(\.\d+)?$/.test(d)) return ' DEFAULT ' + d;
  if (/^'[^'\\]*'$/.test(d)) return ' DEFAULT ' + lit(d.slice(1, -1));
  throw Error('Unsupported default expression');
}
function value(c, v) {
  if (v === null) return null;
  if (c.COLUMN_TYPE === 'tinyint(1)') {
    if (![0, 1, '0', '1', true, false].includes(v))
      throw Error('Non-boolean tinyint');
    return v === true || v === 1 || v === '1';
  }
  if (c.DATA_TYPE === 'datetime') {
    if (
      !/^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d(?:\.\d{1,6})?$/.test(v) ||
      v.startsWith('0000')
    )
      throw Error('Invalid timestamp');
    return v.replace(/\.0+$/, '').replace(/(\.\d*?[1-9])0+$/, '$1');
  }
  if (['int', 'double'].includes(c.DATA_TYPE)) {
    if (!Number.isFinite(Number(v))) throw Error('Nonfinite number');
    return Number(v);
  }
  if (typeof v !== 'string' || v.includes('\0')) throw Error('Invalid string');
  return v;
}
function digest(t, rows) {
  return hash(
    rows
      .map((r) =>
        JSON.stringify(t.columns.map((c) => value(c, r[c.COLUMN_NAME]))),
      )
      .sort()
      .join('\n'),
  );
}
async function verify(db, snapshot) {
  const report = [];
  const actual = (
    await db.query(
      "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename",
    )
  ).rows.map((r) => r.tablename);
  if (
    JSON.stringify(actual) !==
    JSON.stringify(snapshot.tables.map((t) => t.TABLE_NAME).sort())
  )
    throw Error('Table inventory mismatch');
  for (const t of snapshot.tables) {
    const rows = (await db.query(`SELECT * FROM ${q(t.TABLE_NAME)}`)).rows;
    const expected = digest(t, t.rows);
    if (rows.length !== t.rows.length || digest(t, rows) !== expected)
      throw Error('Value mismatch in ' + t.TABLE_NAME);
    report.push({ table: t.TABLE_NAME, rows: rows.length, sha256: expected });
  }
  const constraints = (
    await db.query(
      "SELECT contype, count(*)::int AS count, bool_and(convalidated) AS validated FROM pg_constraint WHERE connamespace='public'::regnamespace GROUP BY contype ORDER BY contype",
    )
  ).rows;
  const expectedPk = snapshot.tables.reduce(
    (n, t) =>
      n +
      group(
        t.indexes.filter((i) => i.INDEX_NAME === 'PRIMARY'),
        'INDEX_NAME',
      ).length,
    0,
  );
  const expectedFk = snapshot.tables.reduce(
    (n, t) => n + group(t.foreignKeys, 'CONSTRAINT_NAME').length,
    0,
  );
  if (
    (constraints.find((c) => c.contype === 'p')?.count || 0) !== expectedPk ||
    (constraints.find((c) => c.contype === 'f')?.count || 0) !== expectedFk ||
    constraints.some((c) => !c.validated)
  )
    throw Error('Constraint validation failed');
  const sequences = (
    await db.query(
      "SELECT count(*)::int AS count FROM pg_sequences WHERE schemaname='public'",
    )
  ).rows[0].count;
  if (sequences !== 0)
    throw Error('Unexpected sequences: manual reconciliation required');
  const indexes = (
    await db.query(
      "SELECT count(*)::int AS count FROM pg_indexes WHERE schemaname='public'",
    )
  ).rows[0].count;
  if (
    indexes !==
    snapshot.tables.reduce(
      (n, t) => n + group(t.indexes, 'INDEX_NAME').length,
      0,
    )
  )
    throw Error('Index inventory mismatch');
  let loginChecks = 0,
    searchChecks = 0;
  if (snapshot.compatibility) {
    for (const item of snapshot.compatibility.loginResolution) {
      const result = await db.query(
        'SELECT user_uuid FROM "user" WHERE rtrim(sprit_fold(user_id)) = rtrim(sprit_fold($1)) COLLATE "C" ORDER BY sprit_fold(user_uuid) COLLATE "C" LIMIT 1',
        [item.userId],
      );
      if (result.rows[0]?.user_uuid !== item.userUuid)
        throw Error('Legacy login resolution mismatch');
      loginChecks++;
    }
    for (const item of snapshot.compatibility.profileSearch) {
      const result = await db.query(
        'SELECT DISTINCT p.user_uuid FROM profile p JOIN "user" u ON u.user_uuid=p.user_uuid WHERE sprit_fold(u.user_nickname) LIKE sprit_fold($1) COLLATE "C"',
        [item.pattern],
      );
      if (
        JSON.stringify(result.rows.map((r) => r.user_uuid).sort()) !==
        JSON.stringify(item.userUuids)
      )
        throw Error('Legacy profile search mismatch');
      searchChecks++;
    }
    for (const item of snapshot.compatibility.patterns) {
      const result = await db.query(
        'SELECT sprit_fold($1) LIKE sprit_fold($2) COLLATE "C" AS matches',
        [item.value, item.pattern],
      );
      if (result.rows[0].matches !== item.matches)
        throw Error('Legacy Unicode pattern mismatch');
      searchChecks++;
    }
  }
  return {
    tables: report,
    loginChecks,
    searchChecks,
    totalRows: report.reduce((n, t) => n + t.rows, 0),
    constraints,
    indexes,
    sequences,
  };
}
async function run() {
  const [mode, file] = process.argv.slice(2);
  if (!['load', 'verify'].includes(mode) || !file)
    throw Error('Usage: migrate-postgres.cjs load|verify SNAPSHOT');
  const target = process.env.MIGRATION_TARGET_DATABASE;
  if (
    !target ||
    target !== process.env.PGDATABASE ||
    !/^(sprit|sprit_rehearsal_[a-z0-9_]+)$/.test(target)
  )
    throw Error('Explicit matching sprit target database required');
  const host = process.env.PGHOST;
  if (
    !host ||
    (!host.startsWith('/') &&
      !['127.0.0.1', 'localhost', '::1'].includes(host) &&
      process.env.MIGRATION_ALLOW_REMOTE !== 'true')
  )
    throw Error('Remote target requires MIGRATION_ALLOW_REMOTE=true');
  const raw = fs.readFileSync(file);
  const s = JSON.parse(raw);
  if (
    s.format !== 1 ||
    s.database !== 'sprit' ||
    s.tables.length !== 22 ||
    Object.values(s.objects).some((a) => a.length)
  )
    throw Error('Unsupported source inventory');
  for (const t of s.tables) {
    if (t.AUTO_INCREMENT !== null || t.ENGINE !== 'InnoDB')
      throw Error('Unsupported identity/engine');
    t.columns.forEach((c) => {
      pgType(c);
      defaultSql(t, c);
    });
    t.rows.forEach((r) => t.columns.forEach((c) => value(c, r[c.COLUMN_NAME])));
    if (t.indexes.some((i) => i.SUB_PART !== null || i.INDEX_TYPE !== 'BTREE'))
      throw Error('Unsupported index');
  }
  const db = new Client({
    application_name: 'sprit-migration',
    options:
      '-c timezone=Asia/Seoul -c statement_timeout=120000 -c lock_timeout=5000',
  });
  await db.connect();
  try {
    const identity = (
      await db.query('SELECT current_database() AS db, current_user AS role')
    ).rows[0];
    if (identity.db !== target) throw Error('Connected database mismatch');
    await db.query(
      mode === 'load'
        ? 'BEGIN'
        : 'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY',
    );
    if (mode === 'load') {
      await db.query(
        "SELECT pg_advisory_xact_lock(hashtext('sprit-migration'))",
      );
      const objects = (
        await db.query(
          "SELECT count(*)::int AS n FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname NOT IN ('pg_catalog','information_schema') AND n.nspname NOT LIKE 'pg_toast%'",
        )
      ).rows[0].n;
      if (objects)
        throw Error('Target is not empty; no overwrite is permitted');
      await db.query(
        "CREATE COLLATION sprit_ci (provider=icu, locale='und-u-ks-level1', deterministic=false)",
      );
      const weights = require('./utf8mb3-general-ci.json');
      const from = weights.pairs.map(([c]) => String.fromCodePoint(c)).join('');
      const to = weights.pairs.map(([, w]) => String.fromCodePoint(w)).join('');
      await db.query(
        `CREATE FUNCTION public.sprit_fold(text) RETURNS text LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE AS $fn$ SELECT translate($1, ${lit(
          from,
        )}, ${lit(to)}) COLLATE "C" $fn$`,
      );
      for (const t of s.tables) {
        const columns = t.columns.map(
          (c) =>
            `${q(c.COLUMN_NAME)} ${pgType(c)}${
              c.IS_NULLABLE === 'NO' ? ' NOT NULL' : ''
            }${defaultSql(t, c)}`,
        );
        await db.query(
          `CREATE TABLE ${q(t.TABLE_NAME)} (${columns.join(',')})`,
        );
        const names = t.columns.map((c) => q(c.COLUMN_NAME)).join(',');
        for (let start = 0; start < t.rows.length; start += 200) {
          const vals = [];
          const tuples = t.rows.slice(start, start + 200).map(
            (r) =>
              '(' +
              t.columns
                .map((c) => {
                  vals.push(value(c, r[c.COLUMN_NAME]));
                  return '$' + vals.length;
                })
                .join(',') +
              ')',
          );
          await db.query(
            `INSERT INTO ${q(t.TABLE_NAME)} (${names}) VALUES ${tuples.join(
              ',',
            )}`,
            vals,
          );
        }
      }
      for (const t of s.tables)
        for (const idx of group(t.indexes, 'INDEX_NAME')) {
          const cols = idx.map((i) => q(i.COLUMN_NAME)).join(',');
          const name = q(t.TABLE_NAME + '_' + idx[0].INDEX_NAME);
          if (idx[0].INDEX_NAME === 'PRIMARY')
            await db.query(
              `ALTER TABLE ${q(
                t.TABLE_NAME,
              )} ADD CONSTRAINT ${name} PRIMARY KEY (${cols})`,
            );
          else
            await db.query(
              `CREATE ${
                Number(idx[0].NON_UNIQUE) === 0 ? 'UNIQUE ' : ''
              }INDEX ${name} ON ${q(t.TABLE_NAME)} (${cols})`,
            );
        }
      for (const t of s.tables)
        for (const fk of group(t.foreignKeys, 'CONSTRAINT_NAME')) {
          const k = fk[0];
          if (
            ![k.UPDATE_RULE, k.DELETE_RULE].every((r) =>
              ['RESTRICT', 'CASCADE', 'SET NULL', 'NO ACTION'].includes(r),
            ) ||
            k.REFERENCED_TABLE_SCHEMA !== 'sprit'
          )
            throw Error('Unsupported foreign key');
          await db.query(
            `ALTER TABLE ${q(t.TABLE_NAME)} ADD CONSTRAINT ${q(
              k.CONSTRAINT_NAME,
            )} FOREIGN KEY (${fk
              .map((k) => q(k.COLUMN_NAME))
              .join(',')}) REFERENCES ${q(k.REFERENCED_TABLE_NAME)} (${fk
              .map((k) => q(k.REFERENCED_COLUMN_NAME))
              .join(',')}) ON UPDATE ${k.UPDATE_RULE} ON DELETE ${
              k.DELETE_RULE
            }`,
          );
        }
    }
    const report = await verify(db, s);
    await db.query('COMMIT');
    console.log(
      JSON.stringify(
        {
          mode,
          target,
          capturedAt: s.capturedAt,
          snapshotSha256: hash(raw),
          ...report,
        },
        null,
        2,
      ),
    );
  } catch (e) {
    await db.query('ROLLBACK');
    throw e;
  } finally {
    await db.end();
  }
}
run().catch((e) => {
  // pg error detail may contain user data. Never print query/parameters/detail.
  console.error('Migration failed:', e.code || e.message);
  process.exitCode = 1;
});
