import { ApplicationError } from '../../utils/errors.js';
import {
  findUserById,
  listUsers,
  updateUserById,
  setUserActiveState,
  softDeleteUser
} from '../../models/user.repository.js';
import { deleteTokensForUserByType } from '../../models/token.repository.js';
import {
  sendAccountDeactivatedEmail,
  sendAccountDeletedEmail,
  sendProfileUpdatedEmail
} from '../notifications/email.service.js';

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

export const listAllUsers = async () => {
  const users = await listUsers({ includeDeleted: true });
  return users.map(toAdminSafeUser);
};

export const updateUserByAdmin = async (targetUserId, updates) => {
  const user = await findUserById(targetUserId, { includeDeleted: true });

  if (!user) {
    throw new ApplicationError('User not found', 404);
  }

  if (user.deletedAt) {
    throw new ApplicationError('Cannot update a deleted user', 400);
  }

  const nextFields = {};
  let didChange = false;
  let deactivated = false;

  if (Object.prototype.hasOwnProperty.call(updates, 'name') && updates.name && updates.name.trim() !== user.name) {
    nextFields.name = updates.name.trim();
    didChange = true;
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'role') && updates.role && updates.role !== user.role) {
    nextFields.role = updates.role;
    didChange = true;
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'isVerified') && updates.isVerified !== user.isVerified) {
    nextFields.isVerified = Boolean(updates.isVerified);
    didChange = true;
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'isActive') && updates.isActive !== user.isActive) {
    nextFields.isActive = Boolean(updates.isActive);
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
    updatedUser = await setUserActiveState(user.id, nextFields.isActive);
  } else {
    updatedUser = await updateUserById(user.id, nextFields);
  }

  if (deactivated) {
    await sendAccountDeactivatedEmail({ user: updatedUser });
  } else if (nextFields.isActive === true && user.isActive === false) {
    await sendProfileUpdatedEmail({ user: updatedUser });
  } else {
    await sendProfileUpdatedEmail({ user: updatedUser });
  }

  return toAdminSafeUser(updatedUser);
};

export const deleteUserByAdmin = async (targetUserId) => {
  const user = await findUserById(targetUserId, { includeDeleted: true });

  if (!user) {
    throw new ApplicationError('User not found', 404);
  }

  if (user.deletedAt) {
    return toAdminSafeUser(user);
  }

  await sendAccountDeletedEmail({ user });
  await softDeleteUser(user.id, new Date());
  await deleteTokensForUserByType({ userId: user.id, type: 'verify_email' });
  await deleteTokensForUserByType({ userId: user.id, type: 'reset_password' });

  const deletedUser = await findUserById(user.id, { includeDeleted: true });
  return toAdminSafeUser(deletedUser);
};
