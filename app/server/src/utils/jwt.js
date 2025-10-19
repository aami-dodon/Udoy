import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import logger from './logger.js';
import AppError from './appError.js';

class JwtError extends AppError {
  constructor(message, { status = 401, code, cause } = {}) {
    super(message, { status, code, cause });
    this.name = 'JwtError';
  }
}

const {
  jwt: {
    access: accessConfig = {},
    refresh: refreshConfig = {},
  } = {},
} = env;

function ensureSecret(secret, type) {
  if (!secret) {
    const message = `Missing ${type} token secret in configuration`;
    logger.error(message);
    throw new JwtError(message, {
      status: 500,
      code: `MISSING_${type.toUpperCase()}_SECRET`,
    });
  }
}

function signToken(payload, secret, config, type, options = {}) {
  ensureSecret(secret, type);

  try {
    return jwt.sign(payload, secret, {
      expiresIn: config.expiresIn,
      ...options,
    });
  } catch (error) {
    logger.error(`Failed to sign ${type} token`, { error: error.message });
    throw new JwtError(`Failed to sign ${type} token`, {
      status: 500,
      code: `SIGN_${type.toUpperCase()}_FAILED`,
      cause: error,
    });
  }
}

function verifyToken(token, secret, type) {
  ensureSecret(secret, type);

  try {
    return jwt.verify(token, secret);
  } catch (error) {
    const level = error.name === 'TokenExpiredError' ? 'info' : 'warn';
    logger[level](`Failed to verify ${type} token`, { error: error.message });
    throw new JwtError(`Invalid ${type} token`, {
      status: 401,
      code: `INVALID_${type.toUpperCase()}_TOKEN`,
      cause: error,
    });
  }
}

export function signAccessToken(payload, options = {}) {
  return signToken(payload, accessConfig.secret, accessConfig, 'access', options);
}

export function signRefreshToken(payload, options = {}) {
  return signToken(payload, refreshConfig.secret, refreshConfig, 'refresh', options);
}

export function verifyAccessToken(token) {
  return verifyToken(token, accessConfig.secret, 'access');
}

export function verifyRefreshToken(token) {
  return verifyToken(token, refreshConfig.secret, 'refresh');
}

export { JwtError };
