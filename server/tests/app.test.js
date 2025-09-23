import request from 'supertest';
import { createApp } from '../src/app/index.js';

describe('Udoy API', () => {
  it('responds to health check', async () => {
    const app = createApp();
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
