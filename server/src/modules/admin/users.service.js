import { randomUUID } from 'crypto';

import { ApplicationError } from '../../utils/errors.js';
import {
  findUserById,
  listUsers,
  updateUserById,
  setUserActiveState,
  softDeleteUser
} from '../../models/user.repository.js';
import { deleteTokensForUserByType } from '../../models/token.repository.js';
import { createAuditLog } from '../../models/auditLog.repository.js';
import {
  sendAccountDeactivatedEmail,
  sendAccountDeletedEmail,
  sendProfileUpdatedEmail
} from '../notifications/email.service.js';
import { logInfo } from '../../utils/logger.js';

const toAdminSafeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  isVerified: user.isVerified,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  deletedAt: user.deletedAt,
  passwordUpdatedAt: user.passwordUpdatedAt
});

const defaultDependencies = {
  userRepository: {
    findUserById,
    listUsers,
    updateUserById,
    setUserActiveState,
    softDeleteUser
  },
  tokenRepository: {
    deleteTokensForUserByType
  },
  auditLogRepository: {
    createAuditLog
  },
  emailService: {
    sendAccountDeactivatedEmail,
    sendAccountDeletedEmail,
    sendProfileUpdatedEmail
  }
};

const mergeDependencies = (overrides = {}) => ({
  userRepository: {
    ...defaultDependencies.userRepository,
    ...(overrides.userRepository || {})
  },
  tokenRepository: {
    ...defaultDependencies.tokenRepository,
    ...(overrides.tokenRepository || {})
  },
  auditLogRepository: {
    ...defaultDependencies.auditLogRepository,
    ...(overrides.auditLogRepository || {})
  },
  emailService: {
    ...defaultDependencies.emailService,
    ...(overrides.emailService || {})
  }
});

export const listAllUsers = async () => {
  const users = await defaultDependencies.userRepository.listUsers({ includeDeleted: true });
  return users.map(toAdminSafeUser);
};

export const updateUserByAdmin = async (targetUserId, updates, options = {}) => {
  const { actorId, dependencies } = options;
  const deps = mergeDependencies(dependencies);
  const { userRepository: userRepo, emailService: emails, auditLogRepository: auditRepo } = deps;
  const user = await userRepo.findUserById(targetUserId, { includeDeleted: true });

  if (!user) {
    throw new ApplicationError('User not found', 404);
  }

  if (user.deletedAt) {
    throw new ApplicationError('Cannot update a deleted user', 400);
  }

  const nextFields = {};
  const changes = {};
  let didChange = false;
  let deactivated = false;

  if (Object.prototype.hasOwnProperty.call(updates, 'name') && updates.name && updates.name.trim() !== user.name) {
    nextFields.name = updates.name.trim();
    changes.name = {
      from: user.name,
      to: nextFields.name
    };
    didChange = true;
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'role') && updates.role && updates.role !== user.role) {
    nextFields.role = updates.role;
    changes.role = {
      from: user.role,
      to: nextFields.role
    };
    didChange = true;
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'isVerified') && updates.isVerified !== user.isVerified) {
    nextFields.isVerified = Boolean(updates.isVerified);
    changes.isVerified = {
      from: user.isVerified,
      to: nextFields.isVerified
    };
    didChange = true;
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'isActive') && updates.isActive !== user.isActive) {
    nextFields.isActive = Boolean(updates.isActive);
    changes.isActive = {
      from: user.isActive,
      to: nextFields.isActive
    };
    didChange = true;
    if (nextFields.isActive === false) {
      deactivated = true;
    }
  }

  if (!didChange) {
    return toAdminSafeUser(user);
  }

  let updatedUser;

  if (Object.prototype.hasOwnProperty.call(nextFields, 'isActive') && Object.keys(nextFields).length === 1) {
    updatedUser = await userRepo.setUserActiveState(user.id, nextFields.isActive);
  } else {
    updatedUser = await userRepo.updateUserById(user.id, nextFields);
  }

  if (deactivated) {
    await emails.sendAccountDeactivatedEmail({ user: updatedUser });
  } else if (nextFields.isActive === true && user.isActive === false) {
    await emails.sendProfileUpdatedEmail({ user: updatedUser });
  } else {
    await emails.sendProfileUpdatedEmail({ user: updatedUser });
  }

  if (Object.keys(changes).length > 0) {
    await auditRepo.createAuditLog({
      id: randomUUID(),
      actorId,
      targetUserId: user.id,
      action: 'admin.user.update',
      metadata: {
        changes
      }
    });
  }

  logInfo('Admin updated user', {
    actorId,
    targetUserId: user.id,
    changes: Object.keys(changes),
    deactivated
  });

  return toAdminSafeUser(updatedUser);
};

export const deleteUserByAdmin = async (targetUserId, options = {}) => {
  const { actorId, dependencies } = options;
  const deps = mergeDependencies(dependencies);
  const { userRepository: userRepo, tokenRepository: tokenRepo, emailService: emails, auditLogRepository: auditRepo } = deps;
  const user = await userRepo.findUserById(targetUserId, { includeDeleted: true });

  if (!user) {
    throw new ApplicationError('User not found', 404);
  }

  if (user.deletedAt) {
    return toAdminSafeUser(user);
  }

  await emails.sendAccountDeletedEmail({ user });
  await userRepo.softDeleteUser(user.id, new Date());
  await tokenRepo.deleteTokensForUserByType({ userId: user.id, type: 'verify_email' });
  await tokenRepo.deleteTokensForUserByType({ userId: user.id, type: 'reset_password' });

  const deletedUser = await userRepo.findUserById(user.id, { includeDeleted: true });

  await auditRepo.createAuditLog({
    id: randomUUID(),
    actorId,
    targetUserId: user.id,
    action: 'admin.user.delete',
    metadata: {
      previous: toAdminSafeUser(user)
    }
  });

  logInfo('Admin deleted user', { actorId, targetUserId: user.id });

  return toAdminSafeUser(deletedUser);
};
