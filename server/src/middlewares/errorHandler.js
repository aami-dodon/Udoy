import { logger } from '../config/logger.js';

/**
 * Express error handler returning consistent JSON responses.
 */
export function errorHandler(err, req, res, next) {
  logger.error('Request failed %s %s: %s', req.method, req.originalUrl, err.message);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal server error'
  });
  next();
}
