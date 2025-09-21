import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

import { ApplicationError } from '../../utils/errors.js';
import { addDurationToNow, generateRawToken, hashToken } from '../../utils/token.js';
import {
  findUserById,
  findUserByEmail,
  normalizeEmail,
  updateUserById
} from '../../models/user.repository.js';
import {
  createUserToken,
  deleteTokensForUserByType
} from '../../models/token.repository.js';
import {
  sendEmailChangeNotifications,
  sendPasswordChangedEmail,
  sendProfileUpdatedEmail
} from '../notifications/email.service.js';
import { env } from '../../config/env.js';

const EMAIL_CHANGE_TOKEN_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

const resolveSupportEmail = () => env.supportEmail || env.email.from || env.email.user || '';

const supportContactInstruction = () => {
  const email = resolveSupportEmail();
  return email ? ` Contact support at ${email}.` : ' Contact support.';
};

const ensureUserActive = (user) => {
  if (!user.isActive) {
    throw new ApplicationError(`Account is deactivated.${supportContactInstruction()}`, 403);
  }
  if (user.deletedAt) {
    throw new ApplicationError(`Account has been deleted.${supportContactInstruction()}`, 403);
  }
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

export const updateProfile = async (userId, payload) => {
  const user = await findUserById(userId, { includePasswordHash: true });

  if (!user) {
    throw new ApplicationError('User not found', 404);
  }

  ensureUserActive(user);

  const nextFields = {};
  let updatedUser = user;
  let nameChanged = false;
  let passwordChanged = false;
  let emailChangeRequested = false;
  let newEmail;

  if (payload.name && payload.name.trim() && payload.name.trim() !== user.name) {
    nextFields.name = payload.name.trim();
    nameChanged = true;
  }

  const wantsPasswordChange = Boolean(payload.newPassword);
  const wantsEmailChange = Boolean(payload.email);

  if (wantsPasswordChange || wantsEmailChange) {
    if (!payload.currentPassword) {
      throw new ApplicationError('Current password is required for sensitive changes', 400);
    }

    const passwordMatches = await bcrypt.compare(payload.currentPassword, user.passwordHash);

    if (!passwordMatches) {
      throw new ApplicationError('Current password is incorrect', 401);
    }
  }

  if (wantsPasswordChange) {
    if (payload.newPassword.length < 6) {
      throw new ApplicationError('New password must be at least 6 characters long', 400);
    }
    const nextPasswordHash = await bcrypt.hash(payload.newPassword, 10);
    nextFields.passwordHash = nextPasswordHash;
    nextFields.passwordUpdatedAt = new Date();
    passwordChanged = true;
  }

  if (wantsEmailChange) {
    newEmail = payload.email.trim();
    const normalizedEmail = normalizeEmail(newEmail);

    if (!newEmail) {
      throw new ApplicationError('Email cannot be empty', 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      throw new ApplicationError('Invalid email format', 400);
    }

    if (normalizedEmail === user.emailNormalized) {
      throw new ApplicationError('New email must be different from the current email', 400);
    }

    const existing = await findUserByEmail(normalizedEmail);
    if (existing && existing.id !== user.id) {
      throw new ApplicationError('Email is already in use', 409);
    }

    const rawToken = generateRawToken();
    await deleteTokensForUserByType({ userId: user.id, type: 'verify_email' });
    await createUserToken({
      id: randomUUID(),
      userId: user.id,
      tokenHash: hashToken(rawToken),
      type: 'verify_email',
      metadata: {
        intent: 'email_change',
        nextEmail: newEmail,
        nextEmailNormalized: normalizedEmail,
        previousEmail: user.email
      },
      expiresAt: addDurationToNow(EMAIL_CHANGE_TOKEN_TTL_MS)
    });

    emailChangeRequested = true;

    await sendEmailChangeNotifications({
      user,
      previousEmail: user.email,
      nextEmail: newEmail,
      token: rawToken
    });
  }

  if (Object.keys(nextFields).length > 0) {
    updatedUser = await updateUserById(user.id, nextFields);
  }

  if (nameChanged && !emailChangeRequested) {
    await sendProfileUpdatedEmail({ user: updatedUser });
  }

  if (passwordChanged) {
    await sendPasswordChangedEmail({ user: updatedUser });
  }

  return {
    user: toSafeUser(updatedUser),
    emailChangePending: emailChangeRequested,
    message: emailChangeRequested
      ? 'Profile updated. Check your new email to confirm the change.'
      : 'Profile updated successfully.'
  };
};
