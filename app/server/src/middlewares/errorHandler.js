import env from '../config/env.js';
import AppError from '../utils/appError.js';
import logger from '../utils/logger.js';

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const appError = AppError.from(err);
  const status = Number.isInteger(appError.status) ? appError.status : 500;

  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    code: err.code,
    status,
    path: req.originalUrl,
    method: req.method,
  });

  const shouldExpose = appError.expose ?? status < 500;
  const response = {
    status: 'error',
    message: shouldExpose ? appError.message : 'Internal server error',
  };

  if (appError.code) {
    response.code = appError.code;
  }

  if (appError.details) {
    response.details = appError.details;
  }

  const isProduction = env.nodeEnv === 'production';
  if (!isProduction) {
    response.trace = err.stack;
  }

  res.status(status).json(response);
}

export default errorHandler;
