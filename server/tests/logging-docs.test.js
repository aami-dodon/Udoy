import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { Writable } from 'node:stream';
import { transports } from 'winston';

import app from '../src/app.js';
import { setLoggerTransports, resetLoggerTransports } from '../src/utils/logger.js';

test('logs structured HTTP access entries', async () => {
  const logs = [];

  const captureStream = new Writable({
    write(chunk, encoding, callback) {
      const payload = chunk.toString().trim();
      if (payload) {
        try {
          logs.push(JSON.parse(payload));
        } catch (error) {
          callback(error);
          return;
        }
      }
      callback();
    }
  });

  try {
    setLoggerTransports([
      new transports.Stream({
        stream: captureStream
      })
    ]);

    await request(app).get('/api/hello');
  } finally {
    resetLoggerTransports();
  }

  assert.ok(
    logs.some(
      (entry) =>
        entry.message === 'HTTP access' &&
        entry.method === 'GET' &&
        entry.url === '/api/hello' &&
        typeof entry.status === 'number' &&
        typeof entry.timestamp === 'string'
    ),
    'expected request log entry missing'
  );
});

test('serves swagger documentation', async () => {
  const response = await request(app).get('/api/docs').redirects(2);
  assert.equal(response.statusCode, 200);
  assert.match(response.headers['content-type'], /html/);
  assert.match(response.text, /Swagger UI/);
});

test('exposes OpenAPI specification json', async () => {
  const response = await request(app).get('/api/docs.json');
  assert.equal(response.statusCode, 200);
  assert.ok(response.body.paths, 'OpenAPI spec missing paths');
  assert.ok(response.body.paths['/api/auth/login'], 'Auth login endpoint not documented');
  assert.ok(response.body.paths['/api/account'], 'Account settings endpoint not documented');
  assert.ok(response.body.paths['/api/admin/users'], 'Admin list users endpoint not documented');
  assert.ok(response.body.paths['/api/admin/users/{id}'], 'Admin user detail endpoints not documented');
  assert.ok(response.body.paths['/api/hello'], 'Hello endpoint not documented');
});
