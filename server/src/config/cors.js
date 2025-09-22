import { env } from './env.js';
import { logWarn } from '../utils/logger.js';

const { allowedOrigins, allowCredentials } = env.cors;

const allowAllOrigins = allowedOrigins.length === 0 || allowedOrigins.includes('*');

export const isOriginAllowed = (origin) => {
  if (!origin) {
    return true;
  }
  if (allowAllOrigins) {
    return true;
  }
  return allowedOrigins.includes(origin);
};

export const buildCorsOptions = () => ({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
      return;
    }

    logWarn('Blocked CORS origin', { origin });
    callback(null, false);
  },
  credentials: allowCredentials,
  optionsSuccessStatus: 204
});
