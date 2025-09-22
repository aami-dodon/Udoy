import morgan from 'morgan';

import { logger } from '../utils/logger.js';

const httpLogFormatter = (tokens, req, res) => {
  const status = Number(tokens.status(req, res));
  const contentLength = tokens.res(req, res, 'content-length');
  const responseTime = Number(tokens['response-time'](req, res));

  const logEntry = {
    message: 'HTTP access',
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: Number.isNaN(status) ? undefined : status,
    responseTimeMs: Number.isNaN(responseTime) ? undefined : responseTime,
    contentLength: contentLength ? Number(contentLength) : undefined,
    userAgent: req.get('user-agent'),
    requestId: req.id,
    userId: req.user?.id
  };

  return JSON.stringify(logEntry);
};

const stream = {
  write: (text) => {
    try {
      const { message, ...metadata } = JSON.parse(text);
      logger.info(message, metadata);
    } catch (error) {
      logger.warn('Failed to parse HTTP log entry', { error: error.message });
    }
  }
};

export const requestLogger = morgan(httpLogFormatter, { stream });
