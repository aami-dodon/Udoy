import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database.js';
import { env } from '../../config/env.js';

const SALT_ROUNDS = 10;

/**
 * Register a new user.
 * @param {{name: string, email: string, password: string, role: string}} payload Incoming data.
 * @returns {Promise<import('../../../../shared/types/index.js').User>} Created user.
 */
export async function registerUser(payload) {
  const hashed = await bcrypt.hash(payload.password, SALT_ROUNDS);
  const user = await prisma.user.upsert({
    where: { email: payload.email },
    update: {},
    create: {
      name: payload.name,
      email: payload.email,
      password: hashed,
      role: payload.role
    }
  });
  return sanitizeUser(user);
}

/**
 * Authenticate and return a signed JWT.
 * @param {{email: string, password: string}} payload Credentials.
 * @returns {Promise<{token: string, user: import('../../../../shared/types/index.js').User}>}
 */
export async function authenticateUser(payload) {
  const user = await prisma.user.findUnique({ where: { email: payload.email } });
  if (!user) {
    throw new Error('Invalid credentials');
  }
  const match = await bcrypt.compare(payload.password, user.password);
  if (!match) {
    throw new Error('Invalid credentials');
  }
  const sanitized = sanitizeUser(user);
  const token = jwt.sign(sanitized, env.jwtSecret, { expiresIn: '7d' });
  return { token, user: sanitized };
}

function sanitizeUser(user) {
  const { password, ...rest } = user;
  return rest;
}
