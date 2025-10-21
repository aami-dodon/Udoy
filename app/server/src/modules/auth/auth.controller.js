import {
  VerificationTokenType,
  AuditEventType,
  GuardianLinkStatus,
  UserStatus,
} from '@prisma/client';
import env from '../../config/env.js';
import AppError from '../../utils/appError.js';
import logger from '../../utils/logger.js';
import prisma from '../../utils/prismaClient.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';
import {
  issueSessionTokens,
  rotateSessionTokens,
  revokeSession,
  generateVerificationToken,
  consumeVerificationToken,
} from '../../services/tokenService.js';
import { parseDuration } from '../../utils/duration.js';
import {
  getUserByEmail,
  getUserAuthPayload,
  createUser,
  ensureGuardianForStudent,
  isMinor,
  normalizeEmail,
  toUserProfile,
} from '../../services/userService.js';
import emailService, {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../../services/emailService.js';
import { logAuditEvent } from '../../services/auditService.js';
import { ROLE_DEFINITIONS } from '../../services/rbacService.js';
import validator from 'validator';

const SELF_REGISTER_ROLE_SET = new Set(
  ROLE_DEFINITIONS.filter((definition) =>
    ['student', 'creator', 'teacher', 'coach', 'sponsor'].includes(definition.name)
  ).map((definition) => definition.name)
);

const DEFAULT_SELF_REGISTER_ROLE = 'student';

const PASSWORD_RESET_TOKEN_DEFAULT_TTL_SECONDS = 15 * 60;
const PASSWORD_RESET_TOKEN_TTL_SECONDS = parseDuration(
  env.auth?.passwordReset?.tokenExpiresIn,
  PASSWORD_RESET_TOKEN_DEFAULT_TTL_SECONDS
);
const PASSWORD_RESET_TOKEN_EXPIRY_MINUTES = Math.max(
  1,
  Math.round(PASSWORD_RESET_TOKEN_TTL_SECONDS / 60)
);

function toMilliseconds(seconds) {
  return Math.max(0, Math.floor(Number(seconds || 0))) * 1000;
}

function buildCookieOptions(maxAgeSeconds) {
  return {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: toMilliseconds(maxAgeSeconds),
  };
}

function attachAuthCookies(res, { accessToken, refreshToken, accessTokenExpiresIn, refreshTokenExpiresIn }) {
  const { jwt = {} } = env;
  const accessCookie = jwt.access?.cookieName;
  const refreshCookie = jwt.refresh?.cookieName;

  if (accessCookie && accessToken) {
    res.cookie(accessCookie, accessToken, buildCookieOptions(accessTokenExpiresIn));
  }

  if (refreshCookie && refreshToken) {
    res.cookie(refreshCookie, refreshToken, {
      ...buildCookieOptions(refreshTokenExpiresIn),
      httpOnly: true,
    });
  }
}

function clearAuthCookies(res) {
  const { jwt = {} } = env;
  const accessCookie = jwt.access?.cookieName;
  const refreshCookie = jwt.refresh?.cookieName;

  if (accessCookie) {
    res.clearCookie(accessCookie, buildCookieOptions(0));
  }

  if (refreshCookie) {
    res.clearCookie(refreshCookie, buildCookieOptions(0));
  }
}

async function buildUserResponse(userId) {
  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: {
          role: {
            include: { rolePermissions: { include: { permission: true } } },
          },
        },
      },
      guardianLinks: true,
    },
  });

  if (!user) {
    return null;
  }

  const authPayload = await getUserAuthPayload(user.id);
  return toUserProfile(user, authPayload);
}

function extractRefreshToken(req) {
  const headerToken = req.headers['x-refresh-token'];
  if (typeof headerToken === 'string' && headerToken.trim()) {
    return headerToken.trim();
  }

  const bodyToken = req.body?.refreshToken;
  if (typeof bodyToken === 'string' && bodyToken.trim()) {
    return bodyToken.trim();
  }

  const { jwt = {} } = env;
  const refreshCookie = jwt.refresh?.cookieName;
  if (refreshCookie && req.cookies?.[refreshCookie]) {
    return req.cookies[refreshCookie];
  }

  return null;
}

function getClientContext(req) {
  return {
    userAgent: req.get('user-agent') || undefined,
    ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
  };
}

async function dispatchVerificationEmail(user, token) {
  try {
    await sendVerificationEmail({
      to: user.email,
      token,
      variables: {
        name: user.firstName || 'there',
      },
    });
  } catch (error) {
    logger.error('Failed to dispatch verification email', {
      error: error.message,
      userId: user.id,
    });
  }
}

async function dispatchGuardianApprovalEmail({ guardianEmail, guardianName, token, studentName }) {
  if (!guardianEmail || !token) {
    return;
  }

  try {
    await emailService.sendEmail({
      to: guardianEmail,
      subject: 'Udoy coach approval required',
      html: `
        <p>Hi ${guardianName || 'there'},</p>
        <p>A new student (${studentName || 'your ward'}) has been registered on Udoy and listed you as their coach.</p>
        <p>Please confirm their participation by visiting the link below:</p>
        <p><a href="${env.email?.verificationUrl ? `${env.email.verificationUrl}?token=${encodeURIComponent(token)}&type=guardian` : '#'}">Approve student</a></p>
        <p>If you were not expecting this request, you can ignore this email.</p>
      `,
      text: `Hi ${guardianName || 'there'},\n\nA student (${studentName || 'your ward'}) has been registered on Udoy and listed you as their coach.\nApprove their participation using the link below:${env.email?.verificationUrl ? ` ${env.email.verificationUrl}?token=${token}&type=guardian` : ''}\nIf you were not expecting this message, you can safely ignore it.`,
    });
  } catch (error) {
    logger.error('Failed to dispatch coach approval email', {
      error: error.message,
      guardianEmail,
    });
  }
}

export async function register(req, res, next) {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      dateOfBirth,
      phoneNumber,
      guardianEmail,
      role,
    } = req.body || {};

    if (!firstName || !firstName.trim()) {
      throw AppError.badRequest('First name is required for registration.');
    }

    if (!lastName || !lastName.trim()) {
      throw AppError.badRequest('Last name is required for registration.');
    }

    if (!email || !validator.isEmail(String(email).trim())) {
      throw AppError.badRequest('A valid email address is required for registration.');
    }

    if (!password) {
      throw AppError.badRequest('Password is required for registration.');
    }

    if (!dateOfBirth) {
      throw AppError.badRequest('Date of birth is required for registration.');
    }

    const normalizedRole = typeof role === 'string' ? role.trim().toLowerCase() : DEFAULT_SELF_REGISTER_ROLE;
    const selectedRole = SELF_REGISTER_ROLE_SET.has(normalizedRole) ? normalizedRole : DEFAULT_SELF_REGISTER_ROLE;

    const dobDate = new Date(dateOfBirth);
    if (Number.isNaN(dobDate.getTime())) {
      throw AppError.badRequest('Provide a valid date of birth.');
    }

    const minor = selectedRole === 'student' && isMinor(dateOfBirth);

    if (minor) {
      if (!guardianEmail || !validator.isEmail(String(guardianEmail).trim())) {
        throw AppError.badRequest('A valid coach email address is required for minors.');
      }
    }

    if (guardianEmail && !validator.isEmail(String(guardianEmail).trim())) {
      throw AppError.badRequest('Provide a valid coach email address.');
    }

    const safeFirstName = firstName.trim();
    const safeLastName = lastName.trim();
    const trimmedGuardianEmail = guardianEmail ? String(guardianEmail).trim() : null;
    const formattedPhoneNumber = typeof phoneNumber === 'string' && phoneNumber.trim() ? phoneNumber.trim() : null;

    const passwordHash = await hashPassword(password);

    const { user } = await createUser(
      {
        email: String(email).trim(),
        passwordHash,
        firstName: safeFirstName,
        lastName: safeLastName,
        dateOfBirth,
        phoneNumber: formattedPhoneNumber,
        guardianEmail: minor ? trimmedGuardianEmail : null,
        guardianConsent: !minor,
      },
      { roles: [selectedRole] }
    );

    if (minor && trimmedGuardianEmail) {
      const guardianLink = await ensureGuardianForStudent(user.id, {
        guardianEmail: trimmedGuardianEmail,
        actorId: user.id,
      });

      const { token: guardianToken } = await generateVerificationToken(guardianLink.guardianId, VerificationTokenType.GUARDIAN_APPROVAL, {
        expiresInSeconds: 7 * 24 * 60 * 60,
        metadata: {
          studentId: user.id,
          guardianLinkId: guardianLink.id,
        },
        actorId: user.id,
      });

      await dispatchGuardianApprovalEmail({
        guardianEmail: trimmedGuardianEmail,
        token: guardianToken,
        studentName: safeFirstName,
      });
    }

    const { token: emailToken } = await generateVerificationToken(user.id, VerificationTokenType.EMAIL_VERIFICATION, {
      metadata: { email: normalizeEmail(email) },
      actorId: user.id,
    });

    await dispatchVerificationEmail(user, emailToken);

    const userResponse = await buildUserResponse(user.id);

    return res.status(201).json({
      status: 'success',
      message: 'Registration successful. Please verify your email to activate the account.',
      user: userResponse,
    });
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      throw AppError.badRequest('Email and password are required.');
    }

    const user = await getUserByEmail(email);
    if (!user || !user.passwordHash) {
      throw AppError.unauthorized('Invalid email or password.', {
        code: 'INVALID_CREDENTIALS',
      });
    }

    const passwordValid = await verifyPassword(password, user.passwordHash);
    if (!passwordValid) {
      throw AppError.unauthorized('Invalid email or password.', {
        code: 'INVALID_CREDENTIALS',
      });
    }

    if (user.status === UserStatus.INACTIVE) {
      throw AppError.forbidden('Account is deactivated. Please contact support.');
    }

    if (user.status === UserStatus.LOCKED) {
      throw AppError.forbidden('Account is locked due to security policies.', {
        code: 'ACCOUNT_LOCKED',
      });
    }

    const context = getClientContext(req);
    const tokens = await issueSessionTokens(user, context);

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    attachAuthCookies(res, tokens);

    await logAuditEvent({
      actorId: user.id,
      eventType: AuditEventType.USER_LOGIN,
      resource: 'auth',
      resourceId: user.id,
      metadata: {
        userAgent: context.userAgent,
        ipAddress: context.ipAddress,
      },
    });

    const userResponse = await buildUserResponse(user.id);

    return res.json({
      status: 'success',
      message: user.isEmailVerified
        ? 'Login successful.'
        : 'Login successful. Email verification is still pending.',
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        accessTokenExpiresIn: tokens.accessTokenExpiresIn,
        refreshTokenExpiresIn: tokens.refreshTokenExpiresIn,
      },
      session: {
        id: tokens.session.id,
        expiresAt: tokens.session.expiresAt,
      },
      user: userResponse,
    });
  } catch (error) {
    return next(error);
  }
}

export async function refresh(req, res, next) {
  try {
    const refreshToken = extractRefreshToken(req);
    if (!refreshToken) {
      throw AppError.unauthorized('Refresh token is required.', {
        code: 'REFRESH_TOKEN_MISSING',
      });
    }

    const context = getClientContext(req);
    const tokens = await rotateSessionTokens(refreshToken, context);

    attachAuthCookies(res, tokens);

    const userResponse = await buildUserResponse(tokens.authPayload.sub);

    return res.json({
      status: 'success',
      message: 'Token refreshed successfully.',
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        accessTokenExpiresIn: tokens.accessTokenExpiresIn,
        refreshTokenExpiresIn: tokens.refreshTokenExpiresIn,
      },
      session: {
        id: tokens.session.id,
        expiresAt: tokens.session.expiresAt,
      },
      user: userResponse,
    });
  } catch (error) {
    return next(error);
  }
}

export async function logout(req, res, next) {
  try {
    const sessionId = req.user?.sid || req.body?.sessionId;
    const actorId = req.user?.sub || null;

    await revokeSession(sessionId, actorId, 'logout');
    clearAuthCookies(res);

    if (actorId) {
      await logAuditEvent({
        actorId,
        eventType: AuditEventType.USER_LOGOUT,
        resource: 'auth',
        resourceId: sessionId || actorId,
      });
    }

    return res.json({
      status: 'success',
      message: 'Successfully logged out.',
    });
  } catch (error) {
    return next(error);
  }
}

export async function verifyEmail(req, res, next) {
  try {
    const { token } = req.body || {};
    if (!token) {
      throw AppError.badRequest('Verification token is required.');
    }

    const record = await consumeVerificationToken(token, VerificationTokenType.EMAIL_VERIFICATION);

    const user = await prisma.user.update({
      where: { id: record.userId },
      data: {
        isEmailVerified: true,
        status: {
          set: UserStatus.ACTIVE,
        },
      },
    });

    await logAuditEvent({
      actorId: user.id,
      eventType: AuditEventType.EMAIL_VERIFIED,
      resource: 'user',
      resourceId: user.id,
    });

    const userResponse = await buildUserResponse(user.id);

    return res.json({
      status: 'success',
      message: 'Email address verified successfully.',
      user: userResponse,
    });
  } catch (error) {
    return next(error);
  }
}

export async function resendVerification(req, res, next) {
  try {
    const { email } = req.body || {};
    if (!email) {
      throw AppError.badRequest('Email address is required.');
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.json({
        status: 'success',
        message: 'If the account exists, a verification email will arrive shortly.',
      });
    }

    if (user.isEmailVerified) {
      return res.json({
        status: 'success',
        message: 'Email address is already verified.',
      });
    }

    const { token } = await generateVerificationToken(user.id, VerificationTokenType.EMAIL_VERIFICATION, {
      actorId: user.id,
      metadata: { email: user.email },
    });

    await dispatchVerificationEmail(user, token);

    return res.json({
      status: 'success',
      message: 'Verification email re-sent successfully.',
    });
  } catch (error) {
    return next(error);
  }
}

export async function requestPasswordReset(req, res, next) {
  try {
    const { email } = req.body || {};
    if (!email) {
      throw AppError.badRequest('Email address is required.');
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.json({
        status: 'success',
        message: 'If the account exists, password reset instructions will be sent.',
      });
    }

    if (!user.isEmailVerified) {
      await logAuditEvent({
        actorId: user.id,
        eventType: AuditEventType.PASSWORD_RESET_REQUESTED,
        resource: 'user',
        resourceId: user.id,
        metadata: {
          email: user.email,
          blocked: true,
          reason: 'EMAIL_NOT_VERIFIED',
        },
      });

      return res.json({
        status: 'success',
        message: 'Please verify your email before requesting a password reset.',
      });
    }

    const { token } = await generateVerificationToken(user.id, VerificationTokenType.PASSWORD_RESET, {
      actorId: user.id,
      metadata: { email: user.email },
      expiresInSeconds: PASSWORD_RESET_TOKEN_TTL_SECONDS,
    });

    try {
      await sendPasswordResetEmail({
        to: user.email,
        token,
        variables: {
          name: user.firstName || 'there',
          expiryMinutes: PASSWORD_RESET_TOKEN_EXPIRY_MINUTES,
        },
      });
    } catch (error) {
      logger.error('Failed to dispatch password reset email', {
        error: error.message,
        userId: user.id,
      });
    }

    return res.json({
      status: 'success',
      message: 'If the account exists, password reset instructions will be sent.',
    });
  } catch (error) {
    return next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body || {};
    if (!token || !password) {
      throw AppError.badRequest('Token and new password are required.');
    }

    const record = await consumeVerificationToken(token, VerificationTokenType.PASSWORD_RESET);
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.update({
      where: { id: record.userId },
      data: {
        passwordHash,
        status: UserStatus.ACTIVE,
      },
    });

    await logAuditEvent({
      actorId: user.id,
      eventType: AuditEventType.PASSWORD_RESET_COMPLETED,
      resource: 'user',
      resourceId: user.id,
    });

    return res.json({
      status: 'success',
      message: 'Password reset successfully. You can now log in with the new password.',
    });
  } catch (error) {
    return next(error);
  }
}

export async function guardianApproval(req, res, next) {
  try {
    const { token, approve = true } = req.body || {};
    if (!token) {
      throw AppError.badRequest('Coach approval token is required.');
    }

    const record = await consumeVerificationToken(token, VerificationTokenType.GUARDIAN_APPROVAL);
    const metadata = record.metadata || {};
    const { guardianLinkId, studentId } = metadata;

    if (!guardianLinkId || !studentId) {
      throw AppError.badRequest('Coach approval token is missing link metadata.', {
        code: 'COACH_TOKEN_INVALID',
      });
    }

    const link = await prisma.guardianLink.update({
      where: { id: guardianLinkId },
      data: {
        status: approve ? GuardianLinkStatus.APPROVED : GuardianLinkStatus.REVOKED,
        consentedAt: approve ? new Date() : null,
        revokedAt: approve ? null : new Date(),
      },
    });

    if (approve) {
      await prisma.user.update({
        where: { id: studentId },
        data: { guardianConsent: true },
      });
    } else {
      await prisma.user.update({
        where: { id: studentId },
        data: { guardianConsent: false },
      });
    }

    await logAuditEvent({
      actorId: record.userId,
      eventType: AuditEventType.GUARDIAN_APPROVED,
      resource: 'guardian-link',
      resourceId: guardianLinkId,
      metadata: { approve, studentId },
    });

    return res.json({
      status: 'success',
      message: approve ? 'Coach approval recorded.' : 'Coach approval revoked.',
      link,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getCurrentSession(req, res, next) {
  try {
    if (!req.user?.sub) {
      throw AppError.unauthorized('Authentication required.');
    }

    const userResponse = await buildUserResponse(req.user.sub);

    return res.json({
      status: 'success',
      user: userResponse,
      session: {
        id: req.user.sid || null,
        roles: req.user.roles || [],
        permissions: req.user.permissions || [],
      },
    });
  } catch (error) {
    return next(error);
  }
}

export default {
  register,
  login,
  refresh,
  logout,
  verifyEmail,
  resendVerification,
  requestPasswordReset,
  resetPassword,
  guardianApproval,
  getCurrentSession,
};
