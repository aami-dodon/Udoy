import { createHash, randomBytes } from 'crypto';

export const generateRawToken = (size = 32) => randomBytes(size).toString('hex');

export const hashToken = (rawToken) =>
  createHash('sha256').update(rawToken).digest('hex');

export const addDurationToNow = (durationMs) => new Date(Date.now() + durationMs);
