import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isNewer, mergeValue } from './util.js';

test('version compare is numeric', () => {
  assert.ok(isNewer('1.0.10', '1.0.9'));
  assert.ok(!isNewer('1.0.9', '1.0.9'));
  assert.ok(!isNewer('1.0.8', '1.0.9'));
});
test('progress merge keeps the best of both', () => {
  assert.deepEqual(mergeValue('known', { a: 1 }, { b: 1 }), { a: 1, b: 1 });
  assert.equal(mergeValue('best_all', 7, 9), 9);
  assert.equal(mergeValue('ptype', undefined, 'tf'), 'tf');
  assert.equal(mergeValue('ptype', 'def', 'tf'), 'def');
});
