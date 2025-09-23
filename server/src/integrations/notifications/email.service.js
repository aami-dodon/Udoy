import { env } from '../../config/env.js';
import { sendEmail } from '../../config/email.js';
import { BRAND_COLORS, BRAND_TYPOGRAPHY } from '../../../../shared/theme/brand.js';

const buildAppUrl = (path) => {
  const base = (env.app.baseUrl || 'http://localhost:3000').replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};

const wrapEmail = (title, content) => {
  const supportLine = env.supportEmail
    ? `<p style="margin-top:12px;">Need help? <a href="mailto:${env.supportEmail}" style="color:${BRAND_COLORS.primary};">Contact support</a>.</p>`
    : '';

  return `
    <div style="font-family:${BRAND_TYPOGRAPHY.fontFamily};line-height:1.6;color:${BRAND_COLORS.text};background:${BRAND_COLORS.background};padding:24px;">
      <div style="max-width:640px;margin:0 auto;background:${BRAND_COLORS.surface};border-radius:12px;padding:32px;box-shadow:0 6px 24px rgba(25,118,210,0.08);">
        <h2 style="color:${BRAND_COLORS.primary};margin-top:0;">${title}</h2>
        <div>${content}</div>
        ${supportLine}
        <p style="margin-top:24px;font-size:12px;color:${BRAND_COLORS.muted};">
          This is an automated message from Udoy. If you did not request this, please ignore.
        </p>
      </div>
    </div>
  `;
};

const buildVerificationContent = ({ name, verifyUrl }) =>
  wrapEmail(
    'Verify Your Email Address',
    `
      <p>Hi ${name},</p>
      <p>Thanks for signing up. Please verify your email address to activate your account.</p>
      <p><a href="${verifyUrl}" style="background:${BRAND_COLORS.primary};color:#fff;padding:10px 18px;text-decoration:none;border-radius:8px;display:inline-block;font-weight:600;">Verify Email</a></p>
      <p>If the button above does not work, copy and paste this link into your browser:<br />
        <a href="${verifyUrl}">${verifyUrl}</a>
      </p>
    `
  );

export const sendVerificationEmail = async ({ user, token, metadata = {}, tokenId }) => {
  const verifyUrl = buildAppUrl(
    `/verify-email?token=${token}&email=${encodeURIComponent(user.email)}`
  );
  await sendEmail({
    to: user.email,
    subject: 'Verify your Udoy account',
    html: buildVerificationContent({ name: user.name, verifyUrl }),
    context: {
      template: 'auth.verify_email',
      userId: user.id,
      intent: metadata.intent,
      tokenType: 'verify_email',
      tokenId
    }
  });
};

export const sendPasswordResetEmail = async ({ user, token, tokenId }) => {
  const resetUrl = buildAppUrl(`/reset-password?token=${token}`);
  const html = wrapEmail(
    'Reset Your Password',
    `
      <p>Hi ${user.name},</p>
      <p>We received a request to reset your Udoy password. Use the link below to set a new password. This link will expire soon.</p>
      <p><a href="${resetUrl}" style="background:${BRAND_COLORS.primary};color:#fff;padding:10px 18px;text-decoration:none;border-radius:8px;display:inline-block;font-weight:600;">Reset Password</a></p>
      <p>If you did not request a password reset, you can safely ignore this email.</p>
    `
  );
  await sendEmail({
    to: user.email,
    subject: 'Udoy password reset instructions',
    html,
    context: {
      template: 'auth.password_reset',
      userId: user.id,
      tokenType: 'reset_password',
      tokenId
    }
  });
};

export const sendPasswordResetConfirmationEmail = async ({ user }) => {
  const html = wrapEmail(
    'Your Password Was Reset',
    `
      <p>Hi ${user.name},</p>
      <p>This is a confirmation that your Udoy password was reset successfully.</p>
      <p>If you did not make this change, please reset your password immediately or contact support.</p>
    `
  );

  await sendEmail({
    to: user.email,
    subject: 'Udoy password reset confirmation',
    html,
    context: {
      template: 'auth.password_reset_confirmation',
      userId: user.id
    }
  });
};

export const sendPasswordChangedEmail = async ({ user }) => {
  const html = wrapEmail(
    'Password Updated',
    `
      <p>Hi ${user.name},</p>
      <p>Your Udoy password was updated from your account settings.</p>
      <p>If you did not perform this update, please reset your password immediately.</p>
    `
  );

  await sendEmail({
    to: user.email,
    subject: 'Udoy password changed',
    html,
    context: {
      template: 'account.password_changed',
      userId: user.id
    }
  });
};

export const sendEmailChangeNotifications = async ({
  user,
  previousEmail,
  nextEmail,
  token,
  tokenId
}) => {
  if (previousEmail) {
    const html = wrapEmail(
      'Your email address changed',
      `
        <p>Hi ${user.name},</p>
        <p>This is to let you know that the email on your Udoy account was changed to <strong>${nextEmail}</strong>.</p>
        <p>If you did not request this change, please contact support immediately.</p>
      `
    );
    await sendEmail({
      to: previousEmail,
      subject: 'Udoy email address changed',
      html,
      context: {
        template: 'account.email_changed_notice',
        userId: user.id,
        recipient: 'previous_email'
      }
    });
  }

  if (nextEmail && token) {
    const verifyUrl = buildAppUrl(
      `/verify-email?token=${token}&email=${encodeURIComponent(nextEmail)}`
    );
    const html = wrapEmail(
      'Confirm Your New Email',
      `
        <p>Hi ${user.name},</p>
        <p>We received a request to use this email for your Udoy account. Please confirm by clicking the button below.</p>
        <p><a href="${verifyUrl}" style="background:${BRAND_COLORS.primary};color:#fff;padding:10px 18px;text-decoration:none;border-radius:8px;display:inline-block;font-weight:600;">Confirm Email</a></p>
        <p>If you did not initiate this, you can ignore this email.</p>
      `
    );
    await sendEmail({
      to: nextEmail,
      subject: 'Verify your new Udoy email address',
      html,
      context: {
        template: 'account.email_change_confirmation',
        userId: user.id,
        recipient: 'new_email',
        tokenType: 'verify_email',
        tokenId
      }
    });
  }
};

export const sendAccountSettingsUpdatedEmail = async ({ user }) => {
  const html = wrapEmail(
    'Account Settings Updated',
    `
      <p>Hi ${user.name},</p>
      <p>Your Udoy account settings were updated successfully.</p>
    `
  );

  await sendEmail({
    to: user.email,
    subject: 'Udoy account settings updated',
    html,
    context: {
      template: 'account.settings_updated',
      userId: user.id
    }
  });
};

export const sendAccountDeactivatedEmail = async ({ user }) => {
  const html = wrapEmail(
    'Account Deactivated',
    `
      <p>Hi ${user.name},</p>
      <p>Your Udoy account has been deactivated by an administrator. You will not be able to sign in until it is reactivated.</p>
      <p>Please contact support if you believe this is a mistake.</p>
    `
  );

  await sendEmail({
    to: user.email,
    subject: 'Udoy account deactivated',
    html,
    context: {
      template: 'account.deactivated',
      userId: user.id
    }
  });
};

export const sendAccountDeletedEmail = async ({ user }) => {
  const html = wrapEmail(
    'Account Deleted',
    `
      <p>Hi ${user.name},</p>
      <p>Your Udoy account has been permanently deleted. All associated data has been removed.</p>
      <p>If this was unexpected, please reach out to our support team.</p>
    `
  );

  await sendEmail({
    to: user.email,
    subject: 'Udoy account deleted',
    html,
    context: {
      template: 'account.deleted',
      userId: user.id
    }
  });
};
