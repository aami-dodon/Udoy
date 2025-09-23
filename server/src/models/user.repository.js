import { getPrismaClient } from '../config/db.js';

export const normalizeEmail = (email = '') => email.trim().toLowerCase();

const baseUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isVerified: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  passwordUpdatedAt: true
};

const authUserSelect = {
  ...baseUserSelect,
  emailNormalized: true,
  passwordHash: true
};

const mapUser = (user) => ({
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

export const createUser = async ({
  id,
  name,
  email,
  emailNormalized,
  passwordHash,
  role,
  isVerified = false,
  isActive = true,
  createdAt,
  passwordUpdatedAt = createdAt
}) => {
  const prisma = getPrismaClient();
  const user = await prisma.user.create({
    data: {
      id,
      name,
      email,
      emailNormalized,
      passwordHash,
      role,
      isVerified,
      isActive,
      createdAt,
      passwordUpdatedAt
    },
    select: baseUserSelect
  });

  return mapUser(user);
};

export const updateUserByEmailNormalized = async ({
  emailNormalized,
  name,
  role,
  passwordHash,
  passwordUpdatedAt,
  isVerified,
  isActive
}) => {
  const prisma = getPrismaClient();
  const existing = await prisma.user.findFirst({
    where: {
      emailNormalized,
      deletedAt: null
    },
    select: { id: true }
  });

  if (!existing) {
    return null;
  }

  const data = {};

  if (typeof name !== 'undefined') {
    data.name = name;
  }
  if (typeof role !== 'undefined') {
    data.role = role;
  }
  if (typeof passwordHash !== 'undefined') {
    data.passwordHash = passwordHash;
  }
  if (typeof passwordUpdatedAt !== 'undefined') {
    data.passwordUpdatedAt = passwordUpdatedAt;
  }
  if (typeof isVerified !== 'undefined') {
    data.isVerified = isVerified;
  }
  if (typeof isActive !== 'undefined') {
    data.isActive = isActive;
  }

  if (Object.keys(data).length === 0) {
    return null;
  }

  const user = await prisma.user.update({
    where: { id: existing.id },
    data,
    select: baseUserSelect
  });

  return mapUser(user);
};

export const updateUserById = async (id, fields) => {
  const prisma = getPrismaClient();
  const existing = await prisma.user.findFirst({
    where: {
      id,
      deletedAt: null
    },
    select: { id: true }
  });

  if (!existing) {
    return null;
  }

  const data = {};

  if (Object.prototype.hasOwnProperty.call(fields, 'name')) {
    data.name = fields.name;
  }
  if (
    Object.prototype.hasOwnProperty.call(fields, 'email') &&
    Object.prototype.hasOwnProperty.call(fields, 'emailNormalized')
  ) {
    data.email = fields.email;
    data.emailNormalized = fields.emailNormalized;
  }
  if (Object.prototype.hasOwnProperty.call(fields, 'role')) {
    data.role = fields.role;
  }
  if (Object.prototype.hasOwnProperty.call(fields, 'passwordHash')) {
    data.passwordHash = fields.passwordHash;
  }
  if (Object.prototype.hasOwnProperty.call(fields, 'isVerified')) {
    data.isVerified = fields.isVerified;
  }
  if (Object.prototype.hasOwnProperty.call(fields, 'isActive')) {
    data.isActive = fields.isActive;
  }
  if (Object.prototype.hasOwnProperty.call(fields, 'passwordUpdatedAt')) {
    data.passwordUpdatedAt = fields.passwordUpdatedAt;
  }
  if (Object.prototype.hasOwnProperty.call(fields, 'deletedAt')) {
    data.deletedAt = fields.deletedAt;
  }

  if (Object.keys(data).length === 0) {
    return findUserById(id, { includeDeleted: true });
  }

  const user = await prisma.user.update({
    where: { id: existing.id },
    data,
    select: baseUserSelect
  });

  return mapUser(user);
};

export const markUserVerified = async (id) => updateUserById(id, { isVerified: true });

export const setUserActiveState = async (id, isActive) => updateUserById(id, { isActive });

export const softDeleteUser = async (id, deletedAt = new Date()) =>
  updateUserById(id, { deletedAt, isActive: false });

export const findUserByEmail = async (emailNormalized) => {
  const prisma = getPrismaClient();
  const user = await prisma.user.findFirst({
    where: {
      emailNormalized,
      deletedAt: null
    },
    select: authUserSelect
  });

  if (!user) {
    return null;
  }

  return {
    ...mapUser(user),
    emailNormalized: user.emailNormalized,
    passwordHash: user.passwordHash
  };
};

export const findUserById = async (
  id,
  { includeDeleted = false, includePasswordHash = false } = {}
) => {
  const prisma = getPrismaClient();
  const user = await prisma.user.findFirst({
    where: {
      id,
      ...(includeDeleted ? {} : { deletedAt: null })
    },
    select: includePasswordHash ? authUserSelect : baseUserSelect
  });

  if (!user) {
    return null;
  }

  if (includePasswordHash) {
    return {
      ...mapUser(user),
      emailNormalized: user.emailNormalized,
      passwordHash: user.passwordHash
    };
  }

  return mapUser(user);
};

export const listUsers = async ({ includeDeleted = false } = {}) => {
  const prisma = getPrismaClient();
  const users = await prisma.user.findMany({
    where: includeDeleted ? {} : { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    select: baseUserSelect
  });
  return users.map(mapUser);
};
