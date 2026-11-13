'use strict';
// Run ONLY against a disposable database cloned from the verified import.
const assert = require('node:assert/strict');
const fs = require('node:fs');
if (
  process.env.REHEARSAL_MODE !== 'true' ||
  process.env.TZ !== 'Asia/Seoul' ||
  !/^sprit_rehearsal_api_/.test(process.env.DATABASE_NAME || '') ||
  !(
    process.env.DATABASE_HOST?.startsWith('/') ||
    (process.env.DATABASE_HOST === '127.0.0.1' &&
      process.env.DATABASE_PORT === '55440')
  )
)
  throw Error('Isolated rehearsal database required');
// No production secrets, .env, Firebase app, automatic schedules or outbound
// traffic are needed. Fail any unexpected network access, including SDK calls.
const net = require('node:net');
const connect = net.Socket.prototype.connect;
net.Socket.prototype.connect = function (...args) {
  const a = Array.isArray(args[0]) ? args[0][0] : args[0];
  const host = typeof a === 'object' ? a.host : args[1];
  const socketPath =
    typeof a === 'object' ? a.path : typeof a === 'string' ? a : null;
  if (
    !(
      socketPath?.startsWith(process.env.DATABASE_HOST + '/') ||
      ['127.0.0.1', 'localhost', '::1'].includes(host)
    )
  )
    throw Error('Rehearsal blocked network');
  return connect.apply(this, args);
};
const { NestFactory } = require('@nestjs/core');
const { DataSource } = require('typeorm');
const request = require('supertest');
const { AppModule } = require('../../src/app.module');
const { ProfileService } = require('../../src/profile/profile.service');
const { LocationService } = require('../../src/location/location.service');
const { ReviewService } = require('../../src/review/review.service');
const { FollowService } = require('../../src/follow/follow.service');
const {
  NotificationRepository,
} = require('../../src/notification/notification.repository');
const { ScheduleService } = require('../../src/schedule/schedule.service');
const { SchedulerRegistry } = require('@nestjs/schedule');
const { GlobalFcmService } = require('../../src/firebase/fcm.service');
const { getApps } = require('firebase-admin/app');
let app,
  step = 'bootstrap';
const checks = [];
const log = console.log;
console.log = () => {}; // Existing application logs can include user data.
async function check(label, fn) {
  step = label;
  await fn();
  checks.push(label);
}
async function main() {
  const snapshot = JSON.parse(fs.readFileSync(process.argv[2]));
  app = await NestFactory.create(AppModule, {
    logger: false,
    abortOnError: false,
  });
  await app.init();
  const ds = app.get(DataSource);
  const repo = (n) =>
    ds.getRepository(ds.entityMetadatas.find((m) => m.tableName === n).target);
  const table = (n) => snapshot.tables.find((t) => t.TABLE_NAME === n);
  await check(
    'all 22 entities, timestamps, booleans and row counts',
    async () => {
      assert.equal(ds.entityMetadatas.length, 22);
      for (const m of ds.entityMetadatas) {
        const t = table(m.tableName),
          rows = await repo(m.tableName).find();
        assert.equal(rows.length, t.rows.length);
        const pk = m.primaryColumns[0].propertyName;
        const byId = new Map(t.rows.map((r) => [r[pk], r]));
        for (const r of rows)
          for (const c of t.columns) {
            if (c.DATA_TYPE === 'datetime' && r[c.COLUMN_NAME] != null)
              assert.equal(
                r[c.COLUMN_NAME].toISOString(),
                new Date(
                  byId.get(r[pk])[c.COLUMN_NAME].replace(' ', 'T') + '+09:00',
                ).toISOString(),
              );
            if (c.COLUMN_TYPE === 'tinyint(1)' && r[c.COLUMN_NAME] != null)
              assert.equal(
                r[c.COLUMN_NAME],
                Boolean(Number(byId.get(r[pk])[c.COLUMN_NAME])),
              );
          }
      }
    },
  );
  await check('runtime role cannot create tables or truncate', async () => {
    for (const sql of [
      'CREATE TABLE forbidden_probe(id int)',
      'TRUNCATE public.version',
    ]) {
      await assert.rejects(ds.query(sql), (e) => e.code === '42501');
    }
  });
  await check('schedules unregistered and Firebase disabled', async () => {
    let registry;
    try {
      registry = app.get(SchedulerRegistry);
    } catch {}
    assert.ok(!registry || registry.getCronJobs().size === 0);
    assert.equal(getApps().length, 0);
    app.get(GlobalFcmService).postMessage('test', 'test', '', 'test');
    assert.equal(getApps().length, 0);
  });
  const profiles = app.get(ProfileService),
    location = app.get(LocationService);
  await check(
    'production profiles: search and random recommendations',
    async () => {
      const users = table('user').rows;
      const results = await profiles.getProfileRecommendList(
        users[0].user_uuid,
      );
      assert.ok(Array.isArray(results));
      const source = table('profile').rows[0];
      const user = users.find((u) => u.user_uuid === source.user_uuid);
      const found = await profiles.searchProfileByNickname(
        user.user_nickname,
        '__none__',
      );
      assert.ok(found.some((p) => p.user_uuid === user.user_uuid));
    },
  );
  await check(
    'production location distance calculation and mixed-case identifiers',
    async () => {
      const l = table('location').rows[0];
      const nearby = await location.findNearbyWithClustering({
        lat: l.lat,
        lng: l.lng,
        radius: 10,
        zoom: 20,
        maxCandidates: 1500,
      });
      assert.ok(nearby.length > 0);
      assert.ok(
        nearby.every(
          (p) => typeof p.lat === 'number' && typeof p.lng === 'number',
        ),
      );
    },
  );
  await check('production review average/count numeric results', async () => {
    const reviews = table('review').rows,
      book = reviews[0].book_uuid,
      selected = reviews.filter((r) => r.book_uuid === book);
    const service = app.get(ReviewService);
    assert.equal(await service.getReviewCountByBookUuid(book), selected.length);
    assert.ok(
      Math.abs(
        (await service.getAverageScoreByBookUuid(book)) -
          selected.reduce((n, r) => n + r.score, 0) / selected.length,
      ) < 1e-10,
    );
  });
  await check('empty profile recommendation result', async () => {
    await ds
      .transaction(async (manager) => {
        await manager.query('DELETE FROM profile_recommend_book');
        await manager.query('DELETE FROM profile');
        const service = new ProfileService(
          {},
          {},
          manager.getRepository(repo('profile').target),
          {},
          {},
          {},
          {},
        );
        assert.deepEqual(await service.getProfileRecommendList('__none__'), []);
        // Force rollback of test-only deletions.
        const rollback = new Error('test rollback');
        rollback.code = 'TEST_ROLLBACK';
        throw rollback;
      })
      .catch((e) => {
        if (e.code !== 'TEST_ROLLBACK') throw e;
      });
    assert.equal(await repo('profile').count(), table('profile').rows.length);
  });
  const http = request(app.getHttpServer());
  let token, user;
  const id = '__sprit_pg_rehearsal__',
    password = 'local-test-only-password';
  await check(
    'health, unauthenticated guard, password login and PAD SPACE comparison',
    async () => {
      await http.get('/health').expect(200);
      await http.get('/v1/record/all').expect(401);
      const bcrypt = require('bcrypt');
      user = await repo('user').save({
        user_uuid: id,
        user_id: id,
        user_nickname: 'Rehearsal한글',
        user_password: await bcrypt.hash(password, 4),
        register_type: 'LOCAL',
        registered_at: new Date('2026-11-13T00:00:00+09:00'),
      });
      const result = await http
        .post('/v1/auth/login')
        .send({ user_id: id.toUpperCase() + ' ', user_password: password })
        .expect(201);
      assert.ok(result.body.access_token);
      token = result.body.access_token;
      await http
        .post('/v1/auth/login')
        .send({ user_id: id, user_password: 'incorrect' })
        .expect(401);
    },
  );
  const auth = (r) => r.set('Authorization', 'Bearer ' + token);
  const bookId = table('book').rows[0].book_uuid;
  let recordId;
  await check('authenticated record create/read/update/delete', async () => {
    const response = await auth(http.post('/v1/record'))
      .send({
        book_uuid: bookId,
        goal_type: 'TIME',
        goal_scale: 60,
        page_start: 1,
      })
      .expect(201);
    recordId = response.text;
    const read = await auth(http.get('/v1/record'))
      .query({ record_uuid: recordId })
      .expect(200);
    assert.equal(read.body.user_uuid, id);
    await auth(http.patch('/v1/record/stop'))
      .query({ record_uuid: recordId, page_end: 12, total_time: 600 })
      .expect(200);
    await auth(http.patch('/v1/record/goal-achieved'))
      .query({ record_uuid: recordId, goal_achieved: 'true' })
      .expect(200);
    const changed = await repo('record').findOneBy({ record_uuid: recordId });
    assert.equal(changed.total_time, 600);
    assert.equal(changed.goal_achieved, true);
    assert.ok(changed.end instanceof Date);
    await auth(http.delete('/v1/record'))
      .query({ record_uuid: recordId })
      .expect(200);
    assert.equal(await repo('record').countBy({ record_uuid: recordId }), 0);
  });
  await check(
    'KST midnight and monthly/daily/weekly record statistics',
    async () => {
      await repo('record').save([
        {
          record_uuid: id + '1',
          user_uuid: id,
          book_uuid: bookId,
          total_time: 120,
          created_at: new Date('2026-11-01T00:00:00+09:00'),
          start: new Date('2026-11-13T00:00:00+09:00'),
          end: new Date('2026-11-13T00:00:00+09:00'),
          goal_achieved: true,
        },
        {
          record_uuid: id + '2',
          user_uuid: id,
          book_uuid: bookId,
          total_time: 240,
          created_at: new Date('2026-11-12T23:59:59+09:00'),
          start: new Date('2026-11-12T23:59:59+09:00'),
          end: new Date('2026-11-12T23:59:59+09:00'),
        },
      ]);
      const daily = await auth(http.get('/v1/record/daily-record'))
        .query({ year: 2026, month: 11, date: 13 })
        .expect(200);
      assert.equal(Number(daily.text), 120);
      for (const [kind, expected] of [
        ['COUNT', 2],
        ['BOOK', 1],
        ['GOAL', 1],
      ]) {
        const monthly = await auth(http.get('/v1/record/monthly-count'))
          .query({ year: 2026, month: 10, kind })
          .expect(200);
        assert.equal(monthly.body.present_month, expected);
      }
      await auth(http.get('/v1/record/weekly-record'))
        .query({ back_week: 0, count: 7, today: new Date().getDay() })
        .expect(200);
    },
  );
  await check(
    'generated UUID defaults, populated recommendation relations, search and profile update',
    async () => {
      const profile = await profiles.setProfile(
        id,
        'profiles/default.png',
        'local test',
        [],
      );
      assert.match(profile.profile_uuid, /^[0-9a-f-]{36}$/);
      await repo('profile_recommend_book').save({
        profile,
        book: { book_uuid: bookId },
        rank: 1,
      });
      const search = await auth(http.get('/v1/profile/search'))
        .query({ keyword: 'rehearsal한글', user_uuid: '__none__' })
        .expect(200);
      assert.ok(
        search.body.some(
          (p) => p.user_uuid === id && p.recommend_list.includes(bookId),
        ),
      );
      await auth(http.patch('/v1/profile/desc'))
        .send({ user_uuid: id, desc: 'changed' })
        .expect(200);
      const get = await auth(http.get('/v1/profile'))
        .query({ user_uuid: id })
        .expect(200);
      assert.equal(get.body.description, 'changed');
      await auth(http.get('/v1/profile/recommend'))
        .query({ user_uuid: id })
        .expect(200);
      const follow = await app
        .get(FollowService)
        .followUser(id, table('user').rows[0].user_uuid);
      assert.match(follow.follow_uuid, /^[0-9a-f-]{36}$/);
      await app
        .get(FollowService)
        .unfollowUser(id, table('user').rows[0].user_uuid);
    },
  );
  await check(
    'location insert, portable ID and authenticated nearby API',
    async () => {
      const before = await repo('location').count();
      await location.saveSpots([
        {
          name: 'Rehearsal',
          roadAddress: 'local only',
          lat: 37.5,
          lng: 127,
          source: 'park',
        },
      ]);
      assert.equal(await repo('location').count(), before + 1);
      await auth(http.get('/v1/locations/near'))
        .query({ lat: 37.5, lng: 127, radius: 50, zoom: 20 })
        .expect(200);
    },
  );
  await check(
    'notification selection and scheduled dispatch with stubbed sink',
    async () => {
      const nr = app.get(NotificationRepository);
      const tokens = await nr.getTimeAgreeFcmToken('agree_01', 20);
      assert.ok(Array.isArray(tokens));
      const calls = [];
      const service = new ScheduleService(
        { sendTimeMessage: (...a) => calls.push(a) },
        {},
        {},
      );
      service.sendTimeMessage20();
      assert.equal(calls[0][4], 20);
    },
  );
  await app.close();
  app = null;
  log(JSON.stringify({ passed: checks.length, checks }, null, 2));
}
main().catch(async (e) => {
  if (app) await app.close();
  console.error('Smoke failed at:', step, 'code:', e.code || e.name);
  // No assertion actual/expected, query detail, response bodies or user values.
  process.exitCode = 1;
});
