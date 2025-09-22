import { env } from '../config/env.js';
import { logError } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || err.statusCode || 500;

  const errorLog = {
    status,
    method: req.method,
    url: req.originalUrl,
    requestId: req.id,
    error: {
      name: err.name,
      message: err.message
    }
  };

  if (env.nodeEnv !== 'production' && err.stack) {
    errorLog.error.stack = err.stack;
  }

  logError('Unhandled application error', errorLog);

  const isServerError = status >= 500;
  const responsePayload = {
    message: isServerError ? 'Internal Server Error' : err.message
  };

  if (!isServerError && err.code) {
    responsePayload.code = err.code;
  }

  if (env.nodeEnv !== 'production' && err.stack) {
    responsePayload.stack = err.stack;
  }

  res.status(status).json(responsePayload);
};
