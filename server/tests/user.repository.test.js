import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeEmail } from '../src/models/user.repository.js';

test('normalizeEmail trims and lowercases', () => {
  const value = '  Example@Domain.COM  ';
  const normalized = normalizeEmail(value);
  assert.equal(normalized, 'example@domain.com');
});
