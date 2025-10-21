import bcrypt from 'bcryptjs';
import AppError from './appError.js';

const SALT_ROUNDS = 12;

export async function hashPassword(password) {
  if (!password || password.length < 8) {
    throw AppError.badRequest('Password must be at least 8 characters long.', {
      code: 'PASSWORD_TOO_SHORT',
    });
  }

  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password, hash) {
  if (!hash) {
    return false;
  }

  return bcrypt.compare(password, hash);
}

export default {
  hashPassword,
  verifyPassword,
};
