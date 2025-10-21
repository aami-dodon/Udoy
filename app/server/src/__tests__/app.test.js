import express from 'express';
import request from 'supertest';
import { jest } from '@jest/globals';

describe('createApp', () => {
  let createApp;
  let registerModules;
  let mockEnv;

  const importApp = async () => {
    jest.resetModules();

    registerModules = jest.fn((app, apiPrefix) => {
      const router = express.Router();
      router.get('/ping', (req, res) => {
        res.json({ message: 'pong', prefix: apiPrefix });
      });
      app.use(apiPrefix, router);
    });

    mockEnv = {
      apiPrefix: '/api',
      corsAllowedOrigins: ['http://localhost:6004'],
      minio: null,
    };

    jest.unstable_mockModule('../config/env.js', () => ({
      default: mockEnv,
    }));

    jest.unstable_mockModule('../modules/index.js', () => ({
      default: registerModules,
    }));

    ({ default: createApp } = await import('../app.js'));
  };

  beforeEach(async () => {
    await importApp();
  });

  it('exposes a root status endpoint', async () => {
    const app = createApp();

    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok', message: 'Udoy server is running' });
  });

  it('mounts module routes with the configured API prefix', async () => {
    const app = createApp();

    const response = await request(app).get('/api/ping');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'pong', prefix: '/api' });
    expect(registerModules).toHaveBeenCalledWith(expect.any(Function), '/api');
  });
});
