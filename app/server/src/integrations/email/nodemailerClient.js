import nodemailer from 'nodemailer';
import env from '../../config/env.js';
import logger from '../../utils/logger.js';

let transporter = null;

const smtpConfig = env.email?.smtp;

if (smtpConfig) {
  transporter = nodemailer.createTransport({
    ...smtpConfig,
  });

  transporter.verify((error) => {
    if (error) {
      logger.error('Failed to verify SMTP connection', {
        error: error.message,
      });
    } else {
      logger.info('SMTP transporter verified and ready');
    }
  });

  transporter.on('error', (error) => {
    logger.error('SMTP transporter connection error', {
      error: error.message,
    });
  });
} else {
  logger.warn('SMTP configuration missing. Email functionality is disabled.');
}

export default transporter;
