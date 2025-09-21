import test from 'node:test';
import assert from 'node:assert/strict';

import { addDurationToNow, generateRawToken, hashToken } from '../src/utils/token.js';

test('generateRawToken returns hex string', () => {
  const token = generateRawToken();
  assert.equal(typeof token, 'string');
  assert.equal(token.length, 64);
  assert.match(token, /^[a-f0-9]+$/);
});

test('hashToken produces deterministic hash', () => {
  const value = 'example-token';
  const first = hashToken(value);
  const second = hashToken(value);
  assert.equal(first, second);
  assert.notEqual(first, value);
});

test('addDurationToNow offsets current time', () => {
  const duration = 1000 * 60 * 5;
  const result = addDurationToNow(duration);
  const now = Date.now();
  const diff = result.getTime() - now;
  assert.ok(diff >= duration - 50);
  assert.ok(diff <= duration + 50);
});
