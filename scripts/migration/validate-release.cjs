'use strict';
// Executed with the release's own compiled code and runtime dependencies.
// All probe writes are in one transaction that is always rolled back.
process.env.REHEARSAL_MODE = 'true';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { DataSource } = require('typeorm');
const { ConfigService } = require('@nestjs/config');
const { JwtService } = require('@nestjs/jwt');
const {
  DatabaseService,
} = require('../../dist/global/config/database/database.service');
const { UserRepository } = require('../../dist/user/user.repository');
const { AuthService } = require('../../dist/auth/auth.service');
const { ProfileService } = require('../../dist/profile/profile.service');
const bcrypt = require('bcrypt');
let ds,
  runner,
  step = 'initialize';
const output = console.log;
console.log = () => {};
(async () => {
  const snapshot = JSON.parse(fs.readFileSync(process.argv[2]));
  const cfg = new ConfigService(process.env),
    jwt = new JwtService();
  ds = new DataSource(new DatabaseService(cfg).createTypeOrmOptions());
  await ds.initialize();
  const repo = (name, manager = ds.manager) =>
    manager.getRepository(
      ds.entityMetadatas.find((m) => m.tableName === name).target,
    );
  const checks = [];
  step = 'legacy login selection';
  const users = new UserRepository(jwt, cfg, repo('user'));
  for (const item of snapshot.compatibility.loginResolution)
    assert.equal(
      (await users.findOneByUserId(item.userId)).user_uuid,
      item.userUuid,
    );
  checks.push('all legacy login selections preserved');
  step = 'legacy profile search';
  const profiles = new ProfileService(
    {},
    {},
    repo('profile'),
    repo('user'),
    repo('book'),
    repo('profile_recommend_book'),
    {},
  );
  for (const item of snapshot.compatibility.profileSearch)
    assert.deepEqual(
      (
        await profiles.searchProfileByNickname(
          item.pattern.slice(1, -1),
          '__none__',
        )
      )
        .map((p) => p.user_uuid)
        .sort(),
      item.userUuids,
    );
  checks.push('all legacy profile searches preserved');
  step = 'all BMP comparison weights';
  const map = new Map(require('./utf8mb3-general-ci.json').pairs);
  let chars = '',
    expected = '';
  for (let cp = 1; cp <= 65535; cp++) {
    if (cp >= 55296 && cp <= 57343) continue;
    chars += String.fromCodePoint(cp);
    expected += String.fromCodePoint(map.get(cp) || cp);
  }
  assert.equal(
    (await ds.query('SELECT sprit_fold($1) AS value', [chars]))[0].value,
    expected,
  );
  checks.push('63487 Unicode BMP weights matched');
  step = 'least privilege';
  const access = (
    await ds.query(
      "SELECT has_schema_privilege(current_user,'public','CREATE') AS ddl, has_table_privilege(current_user,'public.version','TRUNCATE') AS trunc",
    )
  )[0];
  assert.equal(access.ddl, false);
  assert.equal(access.trunc, false);
  checks.push('DDL and TRUNCATE unavailable');
  step = 'rollback-only login and CRUD';
  runner = ds.createQueryRunner();
  await runner.connect();
  await runner.startTransaction();
  const r = (n) => repo(n, runner.manager),
    id = '__cutover_probe_' + require('crypto').randomUUID();
  const password = require('crypto').randomBytes(24).toString('hex');
  const user = await r('user').save({
    user_uuid: id,
    user_id: id,
    user_nickname: 'Mígration ß 한글',
    user_password: await bcrypt.hash(password, 4),
    register_type: 'LOCAL',
    registered_at: new Date('2026-11-13T00:00:00+09:00'),
  });
  const txUsers = new UserRepository(jwt, cfg, r('user'));
  const auth = new AuthService({}, txUsers, cfg, jwt, {});
  const token = await auth.login({
    user_id: id.toUpperCase() + ' ',
    user_password: password,
  });
  assert.ok(token.access_token);
  await assert.rejects(
    auth.login({ user_id: id, user_password: password + 'bad' }),
  );
  const book = snapshot.tables.find((t) => t.TABLE_NAME === 'book').rows[0]
    .book_uuid;
  const rec = await r('record').save({
    record_uuid: id,
    book_uuid: book,
    user_uuid: id,
    total_time: 120,
    goal_achieved: true,
    start: new Date('2026-11-13T00:00:00+09:00'),
  });
  assert.equal(rec.goal_achieved, true);
  await r('record').update(id, { total_time: 240 });
  assert.equal(
    (await r('record').findOneBy({ record_uuid: id })).total_time,
    240,
  );
  const profile = await r('profile').save({
    user,
    image: 'profiles/default.png',
    description: 'rollback probe',
  });
  assert.match(profile.profile_uuid, /^[0-9a-f-]{36}$/);
  await r('profile_recommend_book').save({
    profile,
    book: { book_uuid: book },
    rank: 1,
  });
  const loaded = await r('profile').findOne({
    where: { profile_uuid: profile.profile_uuid },
    relations: ['recommend_list', 'recommend_list.book'],
  });
  assert.equal(loaded.recommend_list[0].book.book_uuid, book);
  await r('record').delete(id);
  assert.equal(await r('record').countBy({ record_uuid: id }), 0);
  await runner.rollbackTransaction();
  await runner.release();
  runner = null;
  assert.equal(await repo('user').countBy({ user_uuid: id }), 0);
  checks.push('password login, UUID, FK, CRUD, KST and rollback');
  if (process.env.PROBE_HTTP_URL) {
    step = 'authenticated HTTP';
    const base = process.env.PROBE_HTTP_URL;
    if (!/^http:\/\/(127\.0\.0\.1|sprit|sprit-pg-image-test):3000$/.test(base))
      throw Error('Unexpected HTTP probe target');
    const real = snapshot.tables.find((t) => t.TABLE_NAME === 'user').rows[0];
    const token = jwt.sign(
      { user_id: real.user_id, login_type: real.register_type },
      { secret: cfg.get('JWT_ACCESS_TOKEN_SECRET'), expiresIn: 60 },
    );
    const l = snapshot.tables.find((t) => t.TABLE_NAME === 'location').rows[0];
    for (const route of [
      '/health',
      '/v1/record/all',
      '/v1/profile/search?keyword=__probe_no_match__&user_uuid=__none__',
      `/v1/locations/near?lat=${l.lat}&lng=${l.lng}&radius=100&zoom=20`,
    ]) {
      const response = await fetch(base + route, {
        headers: { Authorization: 'Bearer ' + token },
      });
      assert.equal(response.status, 200);
      await response.arrayBuffer();
    }
    checks.push('health and authenticated record/profile/location HTTP');
  }
  await ds.destroy();
  ds = null;
  output(JSON.stringify({ passed: checks.length, checks }, null, 2));
})().catch(async (e) => {
  if (runner) {
    await runner.rollbackTransaction().catch(() => {});
    await runner.release();
  }
  if (ds?.isInitialized) await ds.destroy();
  console.error('Release validation failed:', step, e.code || e.name);
  process.exitCode = 1;
});
