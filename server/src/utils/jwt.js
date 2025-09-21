import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';

const ensureSecret = () => {
  if (!env.jwt.secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return env.jwt.secret;
};

export const generateToken = (payload) => {
  const secret = ensureSecret();
  return jwt.sign(payload, secret, { expiresIn: env.jwt.expiresIn });
};

export const verifyToken = (token) => {
  const secret = ensureSecret();
  return jwt.verify(token, secret);
};
