import { test } from 'node:test';
import assert from 'node:assert/strict';
import { accessOf, grantFor, lessonOpen, readConfig } from './access.js';

const now = 1_000_000_000_000;
const cfg = readConfig({});

test('config defaults and parsing', () => {
  assert.equal(cfg.enabled, true);
  assert.deepEqual(readConfig({ free: { hamz: true, nun: false } }).free, ['hamz']);
  assert.equal(readConfig({ enabled: 'false' }).enabled, false);
  assert.equal(readConfig({ trial_days: 'x' }).trial_days, 3);
});

test('free, unlocked and locked lessons', () => {
  const a = accessOf({ record: { unlocks: { nun: { at: 1 }, mim: { at: 1, until: now - 1 } } }, config: cfg, now });
  assert.equal(a.full, false);
  assert.ok(lessonOpen(a, 'hamz', cfg));
  assert.ok(lessonOpen(a, 'nun', cfg));
  assert.ok(!lessonOpen(a, 'mim', cfg));
  assert.ok(!lessonOpen(a, 'sifat', cfg));
});

test('pro, trial, admin and switched off', () => {
  assert.equal(accessOf({ record: { role: 'pro', pro_until: now + 1 }, config: cfg, now }).kind, 'pro');
  assert.equal(accessOf({ record: { role: 'pro', pro_until: now - 1 }, config: cfg, now }).kind, 'expired');
  const t = accessOf({ record: { trial: { start: 0, end: now + 5 } }, config: cfg, now });
  assert.ok(t.full && t.trialUsed);
  assert.ok(accessOf({ record: { trial: { end: now - 5 } }, config: cfg, now }).trialUsed);
  assert.ok(accessOf({ admin: true, config: cfg, now }).full);
  assert.ok(accessOf({ config: readConfig({ enabled: false }), now }).full);
});

test('approving a request', () => {
  assert.equal(grantFor({ type: 'trial' }, cfg, now).trial.end, now + 3 * 86400000);
  assert.equal(grantFor({ type: 'pro' }, cfg, now).pro_until, now + 365 * 86400000);
  assert.deepEqual(grantFor({ type: 'lesson', id: 'nun' }, cfg, now), { 'unlocks/nun': { at: now } });
});
