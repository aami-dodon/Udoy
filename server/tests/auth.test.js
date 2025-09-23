import request from 'supertest';
import { jest } from '@jest/globals';
import app from '../src/app.js';

jest.mock('../src/config/database.js', () => ({
  prisma: {
    user: {
      upsert: jest.fn(({ create }) => Promise.resolve({ ...create, id: 'user-1' })),
      findUnique: jest.fn(({ where }) => {
        if (where.email === 'existing@example.com') {
          return Promise.resolve({
            id: 'user-1',
            name: 'Existing User',
            email: 'existing@example.com',
            role: 'student',
            password: '$2b$10$ZNrnUlCT3VkOqkkpFmSleO0zY9zc3rroWAtxEvsC0Bpvy.buk..qC'
          });
        }
        return Promise.resolve(null);
      })
    }
  }
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn(async () => 'hashed'),
  compare: jest.fn(async (value) => value === 'secret1')
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock-token'),
  verify: jest.fn(() => ({ id: 'user-1', role: 'student' }))
}));

describe('Auth API', () => {
  it('registers a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'secret1', role: 'student' });

    expect(response.status).toBe(201);
    expect(response.body.user).toMatchObject({ name: 'Test User', email: 'test@example.com' });
  });

  it('rejects invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'missing@example.com', password: 'secret1' });

    expect(response.status).toBe(401);
  });
});
