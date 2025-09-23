import { logger } from '../config/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error({
    msg: 'Unhandled error',
    error: err.message,
    stack: err.stack,
  });
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
};
