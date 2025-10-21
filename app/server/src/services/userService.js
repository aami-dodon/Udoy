import {
  AuditEventType,
  GuardianLinkStatus,
  GuardianRelationship,
  UserStatus,
} from '@prisma/client';
import prisma from '../utils/prismaClient.js';
import AppError from '../utils/appError.js';
import logger from '../utils/logger.js';
import { logAuditEvent } from './auditService.js';
import { ensureCoreRbac, getRoleDefinition, ROLE_DEFINITIONS } from './rbacService.js';

export const MINIMUM_MAJOR_AGE = 16;

const authRelations = {
  roles: {
    include: {
      role: {
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  },
  guardianLinks: true,
};

export function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : email;
}

export function calculateAge(dateOfBirth) {
  if (!dateOfBirth) {
    return null;
  }

  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
}

export function isMinor(dateOfBirth) {
  const age = calculateAge(dateOfBirth);
  return age !== null && age < MINIMUM_MAJOR_AGE;
}

export async function getUserByEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return null;
  }

  return prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: authRelations,
  });
}

export async function getUserById(userId) {
  if (!userId) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: userId },
    include: authRelations,
  });
}

function mapPermissionsFromUser(user) {
  const permissions = new Map();

  for (const binding of user.roles || []) {
    const { role } = binding;
    if (!role) continue; // eslint-disable-line no-continue

    for (const rp of role.rolePermissions || []) {
      if (!rp.permission) continue; // eslint-disable-line no-continue
      const { name, resource, action, description } = rp.permission;
      const key = `${resource}:${action}`;
      permissions.set(name, { name, resource, action, description, key });
      permissions.set(key, { name, resource, action, description, key });
    }
  }

  return Array.from(new Map([...permissions].map(([, value]) => [value.key, value])).values());
}

export function toUserProfile(user, authContext = null) {
  if (!user) {
    return null;
  }

  const roles = authContext?.roles || (user.roles || []).map((binding) => binding.role?.name).filter(Boolean);
  const permissions =
    authContext?.permissions ||
    mapPermissionsFromUser(user).map((permission) => ({
      name: permission.name,
      resource: permission.resource,
      action: permission.action,
    }));

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    dateOfBirth: user.dateOfBirth,
    phoneNumber: user.phoneNumber,
    status: user.status,
    isEmailVerified: user.isEmailVerified,
    guardianConsent: user.guardianConsent,
    roles,
    permissions,
    guardianLinks: user.guardianLinks || [],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function getUserAuthPayload(identifier, { includeSensitive = false } = {}) {
  let user = null;
  if (!identifier) {
    return null;
  }

  if (typeof identifier === 'string' && identifier.includes('@')) {
    user = await getUserByEmail(identifier);
  } else {
    user = await getUserById(identifier);
  }

  if (!user) {
    return null;
  }

  const roles = (user.roles || []).map((binding) => binding.role?.name).filter(Boolean);
  const permissions = mapPermissionsFromUser(user);

  return {
    sub: user.id,
    email: user.email,
    roles,
    permissions: permissions.map((permission) => ({
      name: permission.name,
      resource: permission.resource,
      action: permission.action,
    })),
    capabilityKeys: permissions.map((permission) => permission.key),
    status: user.status,
    isEmailVerified: user.isEmailVerified,
    guardianConsent: user.guardianConsent,
    firstName: user.firstName,
    lastName: user.lastName,
    ...(includeSensitive
      ? {
          hasPassword: Boolean(user.passwordHash),
        }
      : {}),
  };
}

export async function ensureUserHasRole(userId, roleName, { actorId } = {}) {
  if (!userId || !roleName) {
    throw AppError.badRequest('Unable to assign role to user', {
      code: 'ROLE_ASSIGNMENT_PARAMS_MISSING',
    });
  }

  await ensureCoreRbac({ actorId });
  const role = await prisma.role.findUnique({ where: { name: roleName } });

  if (!role) {
    throw AppError.badRequest(`Unknown role: ${roleName}`, {
      code: 'ROLE_NOT_FOUND',
    });
  }

  const existing = await prisma.userRole.findUnique({
    where: { userId_roleId: { userId, roleId: role.id } },
  });

  if (existing) {
    return existing;
  }

  const record = await prisma.userRole.create({
    data: {
      userId,
      roleId: role.id,
      assignedById: actorId ?? null,
    },
  });

  await logAuditEvent({
    actorId,
    eventType: AuditEventType.USER_ROLE_ASSIGNED,
    resource: 'user-role',
    resourceId: `${userId}:${role.id}`,
    metadata: { userId, role: roleName },
  });

  return record;
}

export async function removeUserRole(userId, roleName, { actorId } = {}) {
  if (!userId || !roleName) {
    throw AppError.badRequest('Unable to remove role from user', {
      code: 'ROLE_REMOVAL_PARAMS_MISSING',
    });
  }

  const role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) {
    return null;
  }

  const bindingId = { userId, roleId: role.id };

  const existing = await prisma.userRole.findUnique({ where: { userId_roleId: bindingId } });
  if (!existing) {
    return null;
  }

  await prisma.userRole.delete({ where: { userId_roleId: bindingId } });
  await logAuditEvent({
    actorId,
    eventType: AuditEventType.USER_ROLE_REMOVED,
    resource: 'user-role',
    resourceId: `${userId}:${role.id}`,
    metadata: { userId, role: roleName },
  });

  return true;
}

export async function createUser(
  {
    email,
    passwordHash = null,
    firstName,
    lastName,
    dateOfBirth,
    phoneNumber,
    guardianName,
    guardianEmail,
    guardianConsent = false,
    status = UserStatus.ACTIVE,
  },
  { actorId, roles = [] } = {}
) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    throw AppError.badRequest('Email is required');
  }

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    throw AppError.badRequest('An account with this email already exists', {
      code: 'EMAIL_ALREADY_REGISTERED',
    });
  }

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      firstName,
      lastName,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      phoneNumber,
      guardianName,
      guardianEmail: guardianEmail ? normalizeEmail(guardianEmail) : null,
      guardianConsent,
      status,
    },
  });

  await logAuditEvent({
    actorId,
    eventType: AuditEventType.USER_REGISTERED,
    resource: 'user',
    resourceId: user.id,
    metadata: {
      email: user.email,
      status: user.status,
      invitedBy: actorId,
    },
  });

  const assignedRoles = [];
  for (const roleName of roles) {
    try {
      const assignment = await ensureUserHasRole(user.id, roleName, { actorId });
      assignedRoles.push(assignment);
    } catch (error) {
      logger.error('Failed to assign role during user creation', {
        userId: user.id,
        roleName,
        error: error.message,
      });
    }
  }

  return {
    user,
    assignedRoles,
  };
}

export async function ensureGuardianForStudent(studentId, {
  guardianEmail,
  guardianName,
  relationship = GuardianRelationship.PARENT,
  actorId,
} = {}) {
  if (!studentId || !guardianEmail) {
    return null;
  }

  const normalizedGuardianEmail = normalizeEmail(guardianEmail);
  let guardian = await prisma.user.findUnique({ where: { email: normalizedGuardianEmail } });

  if (!guardian) {
    const guardianResult = await createUser(
      {
        email: normalizedGuardianEmail,
        firstName: guardianName || null,
        status: UserStatus.INVITED,
      },
      { actorId, roles: ['coach'] }
    );
    guardian = guardianResult.user;
  } else {
    await ensureUserHasRole(guardian.id, 'coach', { actorId });
  }

  const existingLink = await prisma.guardianLink.findUnique({
    where: {
      guardianId_studentId: {
        guardianId: guardian.id,
        studentId,
      },
    },
  });

  if (existingLink) {
    return existingLink;
  }

  const link = await prisma.guardianLink.create({
    data: {
      guardianId: guardian.id,
      studentId,
      relationship,
      status: GuardianLinkStatus.PENDING,
    },
  });

  await logAuditEvent({
    actorId,
    eventType: AuditEventType.GUARDIAN_INVITED,
    resource: 'guardian-link',
    resourceId: link.id,
    metadata: {
      guardianId: guardian.id,
      studentId,
      relationship,
    },
  });

  return link;
}

export async function updateUserStatus(userId, status, { actorId } = {}) {
  if (!userId || !status) {
    throw AppError.badRequest('Unable to update user status', {
      code: 'USER_STATUS_PARAMS_MISSING',
    });
  }

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { status: true },
  });

  if (!existing) {
    throw AppError.notFound('User not found', {
      code: 'USER_NOT_FOUND',
    });
  }

  const transitioningToInactive = existing.status !== UserStatus.INACTIVE && status === UserStatus.INACTIVE;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      status,
      deactivatedAt: status === UserStatus.ACTIVE ? null : new Date(),
    },
  });

  if (transitioningToInactive) {
    const { revokeAllSessionsForUser } = await import('./tokenService.js');
    await revokeAllSessionsForUser(user.id, {
      actorId,
      reason: 'user_status_inactive',
    });
  }

  await logAuditEvent({
    actorId,
    eventType: status === UserStatus.ACTIVE ? AuditEventType.USER_REACTIVATED : AuditEventType.USER_DEACTIVATED,
    resource: 'user',
    resourceId: user.id,
    metadata: { status },
  });

  return user;
}

export async function listUsers({ skip = 0, take = 25 } = {}) {
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take,
      include: authRelations,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count(),
  ]);

  return { items, total };
}

export async function updateUserProfile(userId, data = {}, { actorId } = {}) {
  if (!userId) {
    throw AppError.badRequest('User ID is required', {
      code: 'USER_ID_REQUIRED',
    });
  }

  const { guardianEmail, guardianName, ...rest } = data;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...rest,
      guardianEmail: guardianEmail ? normalizeEmail(guardianEmail) : null,
      guardianName: guardianName || null,
    },
    include: authRelations,
  });

  await logAuditEvent({
    actorId,
    eventType: AuditEventType.USER_PROFILE_UPDATED,
    resource: 'user',
    resourceId: user.id,
    metadata: rest,
  });

  return user;
}

export async function getRoleCatalog() {
  await ensureCoreRbac();
  return ROLE_DEFINITIONS.map((role) => ({
    name: role.name,
    label: role.label,
    description: role.description,
    permissions: role.permissions,
  }));
}

export function resolveRoleLabel(roleName) {
  const definition = getRoleDefinition(roleName);
  return definition?.label || roleName;
}

export default {
  normalizeEmail,
  calculateAge,
  isMinor,
  getUserByEmail,
  getUserById,
  getUserAuthPayload,
  ensureUserHasRole,
  removeUserRole,
  createUser,
  ensureGuardianForStudent,
  updateUserStatus,
  listUsers,
  updateUserProfile,
  getRoleCatalog,
  resolveRoleLabel,
  toUserProfile,
};
