import nodemailer from 'nodemailer';

import { env } from './env.js';
import { log, logError } from '../utils/logger.js';

let transporter;
let emailConfigured;

const resolveFromAddress = () => env.email.from || env.email.user;

const isEmailConfigured = () => {
  if (emailConfigured === undefined) {
    const hasHost = Boolean(env.email.host);
    const hasAuth = Boolean(env.email.user) && Boolean(env.email.password);
    emailConfigured = hasHost && hasAuth;
    if (!emailConfigured) {
      log('Email transport not fully configured. Emails will be logged to console.');
    }
  }
  return emailConfigured;
};

const createTransporter = () => {
  transporter = nodemailer.createTransport({
    host: env.email.host,
    port: env.email.port,
    secure: env.email.secure,
    auth: {
      user: env.email.user,
      pass: env.email.password
    }
  });
  return transporter;
};

export const getEmailTransporter = () => {
  if (!isEmailConfigured()) {
    return null;
  }

  if (!transporter) {
    transporter = createTransporter();
  }

  return transporter;
};

export const sendEmail = async ({ to, subject, html, text }) => {
  const message = {
    from: resolveFromAddress(),
    to,
    subject,
    text,
    html
  };

  const activeTransporter = getEmailTransporter();

  if (!activeTransporter) {
    log(`Email to ${to} (${subject})`);
    if (html) {
      log(html);
    } else if (text) {
      log(text);
    }
    return;
  }

  try {
    await activeTransporter.sendMail(message);
  } catch (error) {
    logError('Failed to send email');
    throw error;
  }
};
