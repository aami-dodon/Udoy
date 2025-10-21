import env from '../config/env.js';
import transporter from '../integrations/email/nodemailerClient.js';
import logger from '../utils/logger.js';
import AppError from '../utils/appError.js';
import { parseDuration } from '../utils/duration.js';
import { wrapWithBranding } from '../utils/emailBranding.js';

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
  <p>
    Thanks for joining Udoy! Confirm your email address to unlock access to the learning experiences we are preparing.
  </p>
  <p style="text-align:center; margin: 28px 0;">
    <a href="{{verificationLink}}" class="button">Verify email address</a>
  </p>
  <p>If you did not create an account, you can ignore this message.</p>
`;

const DEFAULT_VERIFICATION_TEXT_TEMPLATE = `Hi {{name}},\n\nConfirm your email address by visiting: {{verificationLink}}\nIf you did not create an account, you can ignore this message.`;

const DEFAULT_PASSWORD_RESET_HTML_TEMPLATE = `
  <p>Hi {{name}},</p>
  <p>
    We received a request to reset your Udoy account password. You can create a new one using the secure link below.
  </p>
  <p style="text-align:center; margin: 28px 0;">
    <a href="{{passwordResetLink}}" class="button">Reset your password</a>
  </p>
  <p>This link will expire in {{expiryMinutes}} minutes. If you did not request this change, you can safely ignore this message.</p>
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

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function textToHtml(text) {
  if (!text) {
    return '';
  }

  const segments = String(text).trim().split(/\n{2,}/);
  return segments
    .map((segment) => {
      const line = escapeHtml(segment).replace(/\n/g, '<br />');
      return `<p>${line}</p>`;
    })
    .join('');
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

function isHtmlDocument(markup) {
  if (!markup) {
    return false;
  }

  const trimmed = markup.trim();
  return /^<!doctype\s+html/i.test(trimmed) || /^<html[\s>]/i.test(trimmed);
}

function collapsePreviewText(value) {
  if (!value) {
    return '';
  }

  return String(value)
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 140);
}

export async function sendEmail({ to, subject, html, text, from, branding = {} }) {
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

  const brandingOptions = {
    title: branding.title || subject || 'Udoy Notification',
    previewText: branding.previewText || collapsePreviewText(text),
  };

  let finalHtml = html;

  if (!finalHtml && text) {
    finalHtml = textToHtml(text);
  }

  if (finalHtml && !isHtmlDocument(finalHtml)) {
    finalHtml = wrapWithBranding(finalHtml, brandingOptions);
  }

  const mailOptions = {
    from: resolvedFrom,
    to,
    subject: subject || 'Udoy notification',
    ...(finalHtml ? { html: finalHtml } : {}),
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

  return sendEmail({
    to,
    subject,
    html,
    text,
    branding: {
      previewText: 'Confirm your Udoy email address.',
    },
  });
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

  return sendEmail({
    to,
    subject,
    html,
    text,
    branding: {
      previewText: `Reset your Udoy password within ${PASSWORD_RESET_TOKEN_EXPIRY_MINUTES} minutes.`,
    },
  });
}

export default {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
};
