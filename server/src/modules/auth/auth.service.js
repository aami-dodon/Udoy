import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

import { ApplicationError } from '../../utils/errors.js';
import { generateToken } from '../../utils/jwt.js';
import { addDurationToNow, generateRawToken, hashToken } from '../../utils/token.js';
import { ROLES } from '../../../../shared/constants/index.js';
import {
  createUser,
  findUserByEmail,
  findUserById,
  markUserVerified,
  normalizeEmail,
  updateUserById
} from '../../models/user.repository.js';
import {
  createUserToken,
  deleteTokensForUserByType,
  findActiveTokenByHash,
  findTokenByHash,
  markTokenAsUsed
} from '../../models/token.repository.js';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordResetConfirmationEmail
} from '../notifications/email.service.js';
import { env } from '../../config/env.js';

const allowedSignupRoles = new Set([ROLES.STUDENT, ROLES.TEACHER]);
const VERIFY_EMAIL_TOKEN_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours
const RESET_PASSWORD_TOKEN_TTL_MS = 1000 * 60 * 60; // 1 hour

const resolveSupportEmail = () =>
  env.supportEmail || env.email.from || env.email.user || '';

const assertValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApplicationError('Invalid email format', 400);
  }
};

const supportContactInstruction = () => {
  const email = resolveSupportEmail();
  return email ? ` Contact support at ${email}.` : ' Contact support.';
};

const issueVerificationEmail = async (user, metadata = { intent: 'signup' }) => {
  await deleteTokensForUserByType({ userId: user.id, type: 'verify_email' });
  const rawToken = generateRawToken();
  await createUserToken({
    id: randomUUID(),
    userId: user.id,
    tokenHash: hashToken(rawToken),
    type: 'verify_email',
    metadata,
    expiresAt: addDurationToNow(VERIFY_EMAIL_TOKEN_TTL_MS)
  });
  await sendVerificationEmail({ user, token: rawToken });
  return rawToken;
};

const toSafeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  isVerified: user.isVerified,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  passwordUpdatedAt: user.passwordUpdatedAt,
  deletedAt: user.deletedAt
});

const ensureUserActive = (user) => {
  if (!user.isActive) {
    throw new ApplicationError(`Account is deactivated.${supportContactInstruction()}`, 403);
  }
  if (user.deletedAt) {
    throw new ApplicationError(`Account has been deleted.${supportContactInstruction()}`, 403);
  }
};

export const signUp = async ({ name, email, password, role }) => {
  const normalizedEmail = normalizeEmail(email);

  assertValidEmail(normalizedEmail);

  if (!allowedSignupRoles.has(role)) {
    throw new ApplicationError('Invalid role provided', 400);
  }

  const existingUser = await findUserByEmail(normalizedEmail);
  if (existingUser) {
    throw new ApplicationError('Email already registered', 409);
  }

  if (!password || password.length < 6) {
    throw new ApplicationError('Password must be at least 6 characters long', 400);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const id = randomUUID();
  const createdAt = new Date();

  const user = await createUser({
    id,
    name,
    email,
    emailNormalized: normalizedEmail,
    passwordHash,
    role,
    createdAt
  });

  await issueVerificationEmail(user);

  return {
    user: toSafeUser(user),
    requiresVerification: true,
    supportEmail: resolveSupportEmail()
  };
};

export const login = async ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);
  assertValidEmail(normalizedEmail);

  const userRecord = await findUserByEmail(normalizedEmail);

  if (!userRecord) {
    throw new ApplicationError('Invalid email or password', 401);
  }

  ensureUserActive(userRecord);

  if (!userRecord.isVerified) {
    throw new ApplicationError(
      `Please verify your email address before logging in.${supportContactInstruction()}`,
      403
    );
  }

  const passwordMatches = await bcrypt.compare(password, userRecord.passwordHash);

  if (!passwordMatches) {
    throw new ApplicationError('Invalid email or password', 401);
  }

  const token = generateToken({ sub: userRecord.id, role: userRecord.role });

  return { user: toSafeUser(userRecord), token };
};

export const getUserProfile = async (userId) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new ApplicationError('User not found', 404);
  }

  ensureUserActive(user);

  return toSafeUser(user);
};

export const verifyEmailToken = async (rawToken) => {
  if (!rawToken) {
    throw new ApplicationError('Verification token is required', 400);
  }

  const hashed = hashToken(rawToken);
  const tokenRecord = await findActiveTokenByHash({ tokenHash: hashed, type: 'verify_email' });

  if (!tokenRecord) {
    const staleToken = await findTokenByHash({ tokenHash: hashed, type: 'verify_email' });

    if (!staleToken) {
      throw new ApplicationError(
        `Token is invalid or has expired.${supportContactInstruction()}`,
        400
      );
    }

    const staleUser = await findUserById(staleToken.userId);

    if (!staleUser) {
      throw new ApplicationError('User not found for token', 404);
    }

    ensureUserActive(staleUser);

    if (!staleUser.isVerified) {
      throw new ApplicationError(
        `Token is invalid or has expired.${supportContactInstruction()}`,
        400
      );
    }

    return toSafeUser(staleUser);
  }

  const user = await findUserById(tokenRecord.userId);

  if (!user) {
    throw new ApplicationError('User not found for token', 404);
  }

  ensureUserActive(user);

  const metadata = tokenRecord.metadata || {};

  let updatedUser;

  if (metadata.nextEmail) {
    const nextEmail = metadata.nextEmail;
    const nextEmailNormalized = normalizeEmail(nextEmail);
    updatedUser = await updateUserById(user.id, {
      email: nextEmail,
      emailNormalized: nextEmailNormalized,
      isVerified: true
    });
  } else {
    updatedUser = await markUserVerified(user.id);
  }

  await deleteTokensForUserByType({
    userId: user.id,
    type: 'verify_email',
    excludeTokenId: tokenRecord.id
  });
  await markTokenAsUsed(tokenRecord.id);

  return toSafeUser(updatedUser);
};

export const requestPasswordReset = async (email) => {
  const normalizedEmail = normalizeEmail(email);
  assertValidEmail(normalizedEmail);

  const user = await findUserByEmail(normalizedEmail);

  if (!user || !user.isVerified || !user.isActive) {
    return; // Do not reveal account existence
  }

  const rawToken = generateRawToken();
  await deleteTokensForUserByType({ userId: user.id, type: 'reset_password' });
  await createUserToken({
    id: randomUUID(),
    userId: user.id,
    tokenHash: hashToken(rawToken),
    type: 'reset_password',
    metadata: { intent: 'forgot_password' },
    expiresAt: addDurationToNow(RESET_PASSWORD_TOKEN_TTL_MS)
  });

  await sendPasswordResetEmail({ user, token: rawToken });
};

export const resetPasswordWithToken = async ({ token, newPassword }) => {
  if (!token) {
    throw new ApplicationError('Reset token is required', 400);
  }

  if (!newPassword || newPassword.length < 6) {
    throw new ApplicationError('Password must be at least 6 characters long', 400);
  }

  const hashed = hashToken(token);
  const tokenRecord = await findActiveTokenByHash({ tokenHash: hashed, type: 'reset_password' });

  if (!tokenRecord) {
    throw new ApplicationError(
      `Token is invalid or has expired.${supportContactInstruction()}`,
      400
    );
  }

  const user = await findUserById(tokenRecord.userId);

  if (!user) {
    throw new ApplicationError('User not found for token', 404);
  }

  ensureUserActive(user);

  const passwordHash = await bcrypt.hash(newPassword, 10);
  const updatedUser = await updateUserById(user.id, {
    passwordHash,
    passwordUpdatedAt: new Date()
  });

  await markTokenAsUsed(tokenRecord.id);
  await deleteTokensForUserByType({ userId: user.id, type: 'reset_password' });

  await sendPasswordResetConfirmationEmail({ user: updatedUser });

  return toSafeUser(updatedUser);
};

export const getSupportEmail = resolveSupportEmail;

export const resendVerificationEmail = async (email) => {
  const normalizedEmail = normalizeEmail(email);
  assertValidEmail(normalizedEmail);

  const user = await findUserByEmail(normalizedEmail);

  if (!user || user.isVerified || !user.isActive || user.deletedAt) {
    return {
      message: 'If your account exists, a verification email will be sent shortly.',
      supportEmail: resolveSupportEmail()
    };
  }

  await issueVerificationEmail(user, { intent: 'resend_verification' });

  return {
    message: 'If your account exists, a verification email will be sent shortly.',
    supportEmail: resolveSupportEmail()
  };
};
