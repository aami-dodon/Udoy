import { createLogger, format, transports } from 'winston';

import { env } from '../config/env.js';

const { combine, timestamp, errors, splat, json } = format;

const resolveLogLevel = () => {
  const defaultLevel = env.nodeEnv === 'development' ? 'debug' : 'info';
  const configured = env.logging?.level;

  if (!configured) {
    return defaultLevel;
  }

  return configured.toLowerCase();
};

const buildConsoleTransport = () =>
  new transports.Console({
    handleExceptions: true
  });

export const logger = createLogger({
  level: resolveLogLevel(),
  format: combine(timestamp(), errors({ stack: env.nodeEnv !== 'production' }), splat(), json()),
  exitOnError: false
});

const applyDefaultTransports = () => {
  logger.clear();
  logger.add(buildConsoleTransport());
};

applyDefaultTransports();

export const setLoggerTransports = (customTransports = []) => {
  logger.clear();
  customTransports.forEach((transport) => logger.add(transport));
};

export const resetLoggerTransports = () => {
  applyDefaultTransports();
};

export const logInfo = (message, meta = {}) => {
  logger.info(message, meta);
};

export const logError = (message, meta = {}) => {
  logger.error(message, meta);
};

export const logWarn = (message, meta = {}) => {
  logger.warn(message, meta);
};

export const logDebug = (message, meta = {}) => {
  logger.debug(message, meta);
};
