import test from 'node:test';
import assert from 'node:assert/strict';

import { buildCorsOptions, isOriginAllowed } from '../src/config/cors.js';
import { env } from '../src/config/env.js';

const [defaultOrigin] = env.cors.allowedOrigins.length
  ? env.cors.allowedOrigins
  : ['http://localhost:3000'];

test('isOriginAllowed returns true for configured origins', () => {
  assert.equal(isOriginAllowed(defaultOrigin), true);
});

test('isOriginAllowed returns false for unknown origins', () => {
  assert.equal(isOriginAllowed('https://not-trusted.example'), false);
});

test('buildCorsOptions produces origin validator that mirrors whitelist', () => {
  const corsOptions = buildCorsOptions();
  const expectAllowAll =
    env.cors.allowedOrigins.includes('*') || env.cors.allowedOrigins.length === 0;

  let allowedKnown;
  corsOptions.origin(defaultOrigin, (error, allowed) => {
    assert.equal(error, null);
    allowedKnown = allowed;
  });
  assert.equal(allowedKnown, true);

  let allowedUnknown;
  corsOptions.origin('https://not-trusted.example', (error, allowed) => {
    assert.equal(error, null);
    allowedUnknown = allowed;
  });
  assert.equal(allowedUnknown, expectAllowAll);
});
