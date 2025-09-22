import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

import { env } from '../config/env.js';
import { ApplicationError } from '../utils/errors.js';

const defaultWindowMs = env.rateLimit.windowMs;

const rateLimitHandler = (message) => (req, res, next) => {
  next(
    new ApplicationError(message, 429, {
      code: 'RATE_LIMIT_EXCEEDED'
    })
  );
};

const buildRateLimiter = ({
  keyPrefix,
  limit,
  windowMs = defaultWindowMs,
  message = 'Too many requests, please try again later.'
}) => {
  const resolvedLimit = Number.isFinite(limit) && limit > 0 ? limit : 1;

  return rateLimit({
    windowMs,
    limit: resolvedLimit,
    max: resolvedLimit,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler(message),
    keyGenerator: (req) => `${keyPrefix}:${ipKeyGenerator(req.ip)}`
  });
};

export const signupRateLimiter = buildRateLimiter({
  keyPrefix: 'signup',
  limit: env.rateLimit.maxSignup,
  message: 'Too many signup attempts. Please wait before trying again.'
});

export const loginRateLimiter = buildRateLimiter({
  keyPrefix: 'login',
  limit: env.rateLimit.maxLogin,
  message: 'Too many login attempts. Please try again shortly.'
});

export const forgotPasswordRateLimiter = buildRateLimiter({
  keyPrefix: 'forgot-password',
  limit: env.rateLimit.maxForgotPassword,
  message: 'Too many password reset requests. Please try again later.'
});

export const resetPasswordRateLimiter = buildRateLimiter({
  keyPrefix: 'reset-password',
  limit: env.rateLimit.maxResetPassword,
  message: 'Too many password reset attempts. Please wait before trying again.'
});
