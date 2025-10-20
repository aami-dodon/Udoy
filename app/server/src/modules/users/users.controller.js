import { UserStatus } from '@prisma/client';
import AppError from '../../utils/appError.js';
import logger from '../../utils/logger.js';
import {
  listUsers as listUsersService,
  getUserById,
  updateUserProfile,
  updateUserStatus,
  ensureUserHasRole,
  removeUserRole,
  getRoleCatalog,
  toUserProfile,
} from '../../services/userService.js';

function parsePagination(query = {}) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const pageSize = Math.max(1, Math.min(100, Number.parseInt(query.pageSize, 10) || 25));
  return { page, pageSize };
}

export async function listUsers(req, res, next) {
  try {
    const { page, pageSize } = parsePagination(req.query);
    const { items, total } = await listUsersService({ skip: (page - 1) * pageSize, take: pageSize });
    const profiles = items.map((user) => toUserProfile(user));

    return res.json({
      status: 'success',
      data: {
        items: profiles,
        page,
        pageSize,
        total,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getUser(req, res, next) {
  try {
    const { id } = req.params;
    const user = await getUserById(id);
    if (!user) {
      throw AppError.notFound('User not found.', {
        code: 'USER_NOT_FOUND',
      });
    }

    return res.json({
      status: 'success',
      user: toUserProfile(user),
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { status, ...profile } = req.body || {};

    if (!id) {
      throw AppError.badRequest('User ID is required.');
    }

    let updatedUser = null;
    const actorId = req.user?.sub || null;

    if (Object.keys(profile).length > 0) {
      updatedUser = await updateUserProfile(id, profile, { actorId });
    }

    const normalizedStatus = typeof status === 'string' ? status.trim().toUpperCase() : null;
    if (normalizedStatus) {
      if (!Object.values(UserStatus).includes(normalizedStatus)) {
        throw AppError.badRequest('Invalid user status value provided.', {
          code: 'USER_STATUS_INVALID',
        });
      }
      updatedUser = await updateUserStatus(id, normalizedStatus, { actorId });
    }

    const finalUser = updatedUser || (await getUserById(id));

    if (!finalUser) {
      throw AppError.notFound('User not found.', {
        code: 'USER_NOT_FOUND',
      });
    }

    return res.json({
      status: 'success',
      user: toUserProfile(finalUser),
    });
  } catch (error) {
    return next(error);
  }
}

export async function setUserRoles(req, res, next) {
  try {
    const { id } = req.params;
    const { roles = [] } = req.body || {};

    if (!Array.isArray(roles)) {
      throw AppError.badRequest('Roles payload must be an array of role names.');
    }

    const definitions = await getRoleCatalog();
    const availableRoles = new Set(definitions.map((role) => role.name));

    const normalizedRoles = Array.from(
      new Set(
        roles
          .map((role) => (typeof role === 'string' ? role.trim() : ''))
          .filter((role) => role && availableRoles.has(role))
      )
    );

    const actorId = req.user?.sub || null;
    const user = await getUserById(id);
    if (!user) {
      throw AppError.notFound('User not found.', {
        code: 'USER_NOT_FOUND',
      });
    }

    const currentRoles = new Set(
      (user.roles || [])
        .map((binding) => binding.role?.name)
        .filter(Boolean)
    );

    await Promise.all(
      normalizedRoles
        .filter((role) => !currentRoles.has(role))
        .map((role) => ensureUserHasRole(id, role, { actorId }))
    );

    await Promise.all(
      Array.from(currentRoles)
        .filter((role) => !normalizedRoles.includes(role))
        .map((role) => removeUserRole(id, role, { actorId }))
    );

    const updatedUser = await getUserById(id);

    return res.json({
      status: 'success',
      user: toUserProfile(updatedUser),
    });
  } catch (error) {
    logger.error('Failed to update user roles', {
      error: error.message,
      userId: req.params?.id,
    });
    return next(error);
  }
}

export async function removeUserRoleBinding(req, res, next) {
  try {
    const { id, roleName } = req.params;
    const normalizedRole = typeof roleName === 'string' ? roleName.trim() : '';
    if (!id || !normalizedRole) {
      throw AppError.badRequest('User ID and role name are required.');
    }

    await removeUserRole(id, normalizedRole, { actorId: req.user?.sub || null });

    const updatedUser = await getUserById(id);
    if (!updatedUser) {
      throw AppError.notFound('User not found.', {
        code: 'USER_NOT_FOUND',
      });
    }

    return res.json({
      status: 'success',
      user: toUserProfile(updatedUser),
    });
  } catch (error) {
    return next(error);
  }
}

export async function listRoleCatalog(_req, res, next) {
  try {
    const roles = await getRoleCatalog();
    return res.json({
      status: 'success',
      roles,
    });
  } catch (error) {
    return next(error);
  }
}

export default {
  listUsers,
  getUser,
  updateUser,
  setUserRoles,
  removeUserRoleBinding,
  listRoleCatalog,
};
