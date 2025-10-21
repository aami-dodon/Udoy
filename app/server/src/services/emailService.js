import env from '../config/env.js';
import transporter from '../integrations/email/nodemailerClient.js';
import logger from '../utils/logger.js';
import AppError from '../utils/appError.js';
import { parseDuration } from '../utils/duration.js';

const DEFAULT_VERIFICATION_SUBJECT = 'Verify your email address';
const DEFAULT_PASSWORD_RESET_SUBJECT = 'Reset your Udoy account password';

const PASSWORD_RESET_TOKEN_DEFAULT_TTL_SECONDS = 15 * 60;
const PASSWORD_RESET_TOKEN_EXPIRY_SECONDS = parseDuration(
  env.auth?.passwordReset?.tokenExpiresIn,
  PASSWORD_RESET_TOKEN_DEFAULT_TTL_SECONDS
);
const PASSWORD_RESET_TOKEN_EXPIRY_MINUTES = Math.max(
  1,
  Math.round(PASSWORD_RESET_TOKEN_EXPIRY_SECONDS / 60)
);

const DEFAULT_VERIFICATION_HTML_TEMPLATE = `
  <p>Hi {{name}},</p>
  <p>Thanks for joining Udoy! Confirm your email address by clicking the link below:</p>
  <p><a href="{{verificationLink}}">Verify email address</a></p>
  <p>If you did not create an account, you can ignore this email.</p>
`;

const DEFAULT_VERIFICATION_TEXT_TEMPLATE = `Hi {{name}},\n\nConfirm your email address by visiting: {{verificationLink}}\nIf you did not create an account, you can ignore this message.`;

const DEFAULT_PASSWORD_RESET_HTML_TEMPLATE = `
  <p>Hi {{name}},</p>
  <p>We received a request to reset your Udoy account password. You can set a new password using the link below:</p>
  <p><a href="{{passwordResetLink}}">Reset your password</a></p>
  <p>This link will expire in {{expiryMinutes}} minutes. If you did not request this change, feel free to ignore this email.</p>
`;

const DEFAULT_PASSWORD_RESET_TEXT_TEMPLATE = `Hi {{name}},\n\nReset your Udoy password using the link below:\n{{passwordResetLink}}\nThis link will expire in {{expiryMinutes}} minutes. If you didn't request this change, you can ignore this message.`;

function ensureTransporter() {
  if (!transporter) {
    throw AppError.serviceUnavailable('Email transporter is not configured.', {
      code: 'EMAIL_TRANSPORTER_UNAVAILABLE',
      expose: false,
    });
  }

  return transporter;
}

function renderTemplate(template, variables = {}) {
  if (!template) {
    return '';
  }

  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
    const value = variables[key];
    return value !== undefined && value !== null ? String(value) : '';
  });
}

function buildLink(baseUrl, token, tokenKey = 'token') {
  if (!baseUrl) {
    return null;
  }

  if (!token) {
    return baseUrl;
  }

  try {
    const url = new URL(baseUrl);
    url.searchParams.set(tokenKey, token);
    return url.toString();
  } catch (error) {
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}${tokenKey}=${encodeURIComponent(token)}`;
  }
}

async function sendEmail({ to, subject, html, text, from }) {
  if (!to) {
    throw AppError.badRequest('Recipient email address is required.', {
      code: 'EMAIL_RECIPIENT_REQUIRED',
    });
  }

  const resolvedFrom = from || env.email?.from;

  if (!resolvedFrom) {
    throw AppError.serviceUnavailable('Sender email address is not configured.', {
      code: 'EMAIL_SENDER_UNCONFIGURED',
    });
  }

  if (!html && !text) {
    throw AppError.badRequest('Email content is required (html or text).', {
      code: 'EMAIL_CONTENT_REQUIRED',
    });
  }

  const mailOptions = {
    from: resolvedFrom,
    to,
    subject: subject || 'Udoy notification',
    ...(html ? { html } : {}),
    ...(text ? { text } : {}),
  };

  const mailTransporter = ensureTransporter();

  try {
    const info = await mailTransporter.sendMail(mailOptions);
    logger.info('Email dispatched successfully', {
      messageId: info.messageId,
      to,
      subject: mailOptions.subject,
    });
    return info;
  } catch (error) {
    logger.error('Failed to dispatch email', {
      error: error.message,
      to,
      subject: mailOptions.subject,
    });
    throw AppError.from(error, {
      status: 502,
      code: 'EMAIL_DISPATCH_FAILED',
      details: { to, subject: mailOptions.subject },
    });
  }
}

export async function sendVerificationEmail({
  to,
  token,
  subject = DEFAULT_VERIFICATION_SUBJECT,
  template = DEFAULT_VERIFICATION_HTML_TEMPLATE,
  textTemplate = DEFAULT_VERIFICATION_TEXT_TEMPLATE,
  variables = {},
}) {
  const verificationLink = buildLink(env.email?.verificationUrl, token, 'token');
  const mergedVariables = {
    name: 'there',
    ...variables,
    verificationLink,
  };

  const html = renderTemplate(template, mergedVariables);
  const text = renderTemplate(textTemplate, mergedVariables);

  return sendEmail({ to, subject, html, text });
}

export async function sendPasswordResetEmail({
  to,
  token,
  subject = DEFAULT_PASSWORD_RESET_SUBJECT,
  template = DEFAULT_PASSWORD_RESET_HTML_TEMPLATE,
  textTemplate = DEFAULT_PASSWORD_RESET_TEXT_TEMPLATE,
  variables = {},
}) {
  const passwordResetLink = buildLink(env.email?.passwordResetUrl, token, 'token');
  const mergedVariables = {
    name: 'there',
    expiryMinutes: PASSWORD_RESET_TOKEN_EXPIRY_MINUTES,
    ...variables,
    passwordResetLink,
  };

  const html = renderTemplate(template, mergedVariables);
  const text = renderTemplate(textTemplate, mergedVariables);

  return sendEmail({ to, subject, html, text });
}

export default {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
};
