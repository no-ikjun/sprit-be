const mysql = require('mysql2/promise');
(async () => {
  const db = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: 'sprit',
  });
  try {
    await db.query('START TRANSACTION READ ONLY');
    const [rows] = await db.query(
      "SELECT seq AS cp, HEX(WEIGHT_STRING(CONVERT(CONVERT(UNHEX(LPAD(HEX(seq),4,'0')) USING ucs2) USING utf8mb3) COLLATE utf8mb3_general_ci)) AS weight FROM seq_1_to_65535 WHERE seq NOT BETWEEN 55296 AND 57343 ORDER BY seq",
    );
    if (
      rows.length !== 63487 ||
      rows.some(
        (r) => !/^[0-9A-F]{4}$/.test(r.weight) || parseInt(r.weight, 16) === 0,
      )
    )
      throw Error('Unsupported weight map');
    const pairs = rows
      .map((r) => [Number(r.cp), parseInt(r.weight, 16)])
      .filter(([c, w]) => c !== w);
    process.stdout.write(
      JSON.stringify({
        collation: 'utf8mb3_general_ci',
        sourceVersion: '10.6.23',
        testedCodepoints: rows.length,
        pairs,
      }),
    );
    await db.query('ROLLBACK');
  } finally {
    await db.end();
  }
})().catch((e) => {
  console.error(e.code || e.message);
  process.exitCode = 1;
});
