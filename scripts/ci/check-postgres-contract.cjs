'use strict';
const assert = require('node:assert/strict');
const {ConfigService} = require('@nestjs/config');
const {DatabaseService} = require('../../dist/global/config/database/database.service');
// No network or production credentials. Inspect the compiled production options.
process.env.TZ = 'Asia/Seoul';
const config = new ConfigService({DATABASE_TYPE: 'postgres', DATABASE_HOST: 'postgres',
  DATABASE_PORT: '5432', DATABASE_NAME: 'sprit', DATABASE_USER: 'sprit_app'});
const options = new DatabaseService(config).createTypeOrmOptions();
assert.equal(options.type, 'postgres');
assert.equal(options.database, 'sprit');
assert.equal(options.synchronize, false);
assert.equal(options.installExtensions, false);
assert.match(options.extra.options, /timezone=Asia\/Seoul/);
assert.ok(options.entities.length >= 22);
console.log('PASS: compiled PostgreSQL configuration, schema sync disabled, KST, entities');
