import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Authenticate requests using JWT bearer tokens.
 */
export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  const token = header.replace('Bearer ', '');

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
