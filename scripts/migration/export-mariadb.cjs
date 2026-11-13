// Run inside the existing app container: docker exec -i sprit node < this-file.
// stdout contains PRIVATE data; redirect to a mode-0600 file, never a terminal.
'use strict';
const mysql = require('mysql2/promise');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const qi = (s) => '`' + s.replace(/`/g, '``') + '`';
async function main() {
  if (process.env.DATABASE_NAME !== 'sprit')
    throw Error('Unexpected source database');
  const db = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: 'sprit',
    dateStrings: true,
    supportBigNumbers: true,
    bigNumberStrings: true,
  });
  try {
    await db.query("SET SESSION time_zone = '+09:00'");
    await db.query('SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ');
    await db.query('START TRANSACTION WITH CONSISTENT SNAPSHOT, READ ONLY');
    const [server] = await db.query(
      'SELECT VERSION() AS version, @@global.time_zone AS global_timezone, @@session.time_zone AS session_timezone, @@system_time_zone AS system_timezone, @@collation_database AS collation',
    );
    const [tables] = await db.query(
      "SELECT TABLE_NAME, ENGINE, TABLE_COLLATION, AUTO_INCREMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA='sprit' AND TABLE_TYPE='BASE TABLE' ORDER BY TABLE_NAME",
    );
    if (tables.some((t) => t.ENGINE !== 'InnoDB'))
      throw Error('Non-transactional table');
    const output = {
      format: 1,
      capturedAt: new Date().toISOString(),
      database: 'sprit',
      server: server[0],
      nodeTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      tables: [],
      objects: {},
    };
    for (const table of tables) {
      const name = table.TABLE_NAME;
      const [columns] = await db.query(
        'SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME=? ORDER BY ORDINAL_POSITION',
        ['sprit', name],
      );
      const [indexes] = await db.query(
        'SELECT * FROM information_schema.STATISTICS WHERE TABLE_SCHEMA=? AND TABLE_NAME=? ORDER BY INDEX_NAME, SEQ_IN_INDEX',
        ['sprit', name],
      );
      const [foreignKeys] = await db.query(
        'SELECT k.*, r.UPDATE_RULE, r.DELETE_RULE FROM information_schema.KEY_COLUMN_USAGE k JOIN information_schema.REFERENTIAL_CONSTRAINTS r ON k.CONSTRAINT_SCHEMA=r.CONSTRAINT_SCHEMA AND k.CONSTRAINT_NAME=r.CONSTRAINT_NAME AND k.TABLE_NAME=r.TABLE_NAME WHERE k.TABLE_SCHEMA=? AND k.TABLE_NAME=? ORDER BY k.CONSTRAINT_NAME, k.ORDINAL_POSITION',
        ['sprit', name],
      );
      const [ddl] = await db.query('SHOW CREATE TABLE ' + qi(name));
      const [rows] = await db.query('SELECT * FROM ' + qi(name));
      output.tables.push({
        ...table,
        columns,
        indexes,
        foreignKeys,
        ddl: ddl[0]['Create Table'],
        rows,
      });
    }
    for (const [name, sql] of Object.entries({
      views:
        "SELECT TABLE_NAME FROM information_schema.VIEWS WHERE TABLE_SCHEMA='sprit'",
      triggers:
        "SELECT TRIGGER_NAME FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA='sprit'",
      routines:
        "SELECT ROUTINE_NAME FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA='sprit'",
      events:
        "SELECT EVENT_NAME FROM information_schema.EVENTS WHERE EVENT_SCHEMA='sprit'",
    })) {
      output.objects[name] = (await db.query(sql))[0];
    }
    output.compatibility = {
      loginResolution: [],
      profileSearch: [],
      patterns: [],
    };
    const users = output.tables.find((t) => t.TABLE_NAME === 'user').rows;
    for (const userId of new Set(users.map((u) => u.user_id))) {
      const [selected] = await db.query(
        'SELECT user_uuid FROM user WHERE user_id=? LIMIT 1',
        [userId],
      );
      output.compatibility.loginResolution.push({
        userId,
        userUuid: selected[0].user_uuid,
      });
    }
    for (const pattern of new Set(
      users.map((u) => '%' + u.user_nickname + '%'),
    )) {
      const [selected] = await db.query(
        'SELECT DISTINCT p.user_uuid FROM profile p JOIN user u ON u.user_uuid=p.user_uuid WHERE u.user_nickname LIKE ?',
        [pattern],
      );
      output.compatibility.profileSearch.push({
        pattern,
        userUuids: selected.map((r) => r.user_uuid).sort(),
      });
    }
    for (const [value, pattern] of [
      ['é', '%e%'],
      ['ß', '%s%'],
      ['ß', '%ss%'],
      ['İ', '%i%'],
      ['가', '%가%'],
      ['a ', 'a'],
      ['ab', 'a_'],
      ['a_b', 'a\\_b'],
      ['가́', '가_'],
    ]) {
      const [result] = await db.query(
        'SELECT CONVERT(? USING utf8mb3) COLLATE utf8mb3_general_ci LIKE CONVERT(? USING utf8mb3) AS matches',
        [value, pattern],
      );
      output.compatibility.patterns.push({
        value,
        pattern,
        matches: !!result[0].matches,
      });
    }
    output.sourceHashes = {};
    function walk(dir) {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (p.endsWith('.ts'))
          output.sourceHashes[p] = crypto
            .createHash('sha256')
            .update(fs.readFileSync(p))
            .digest('hex');
      }
    }
    walk('src');
    await db.query('ROLLBACK');
    process.stdout.write(JSON.stringify(output));
  } finally {
    await db.end();
  }
}
main().catch((e) => {
  console.error('Source export failed:', e.code || e.name);
  process.exitCode = 1;
});
