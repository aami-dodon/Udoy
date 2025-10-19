import logger from '../utils/logger.js';

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
  });

  const status = err.status || 500;
  const response = {
    status: 'error',
    message: err.message || 'Internal server error',
  };

  res.status(status).json(response);
}

export default errorHandler;
