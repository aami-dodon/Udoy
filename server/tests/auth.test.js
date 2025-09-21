import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

import app from '../src/app.js';

test('GET /api/auth/me requires authentication', async () => {
  const response = await request(app).get('/api/auth/me');
  assert.equal(response.statusCode, 401);
  assert.match(response.body.message, /unauthorized/i);
});
