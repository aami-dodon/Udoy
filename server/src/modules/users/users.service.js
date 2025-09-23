import bcrypt from 'bcrypt';
import { prisma } from '../../config/database.js';
import { createHttpError } from '../../utils/errors.js';

const SALT_ROUNDS = 10;

export const listUsers = (filter = {}) =>
  prisma.user.findMany({
    where: filter,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      classLevel: true,
      createdAt: true,
    },
  });

export const getUserById = (id) =>
  prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      classLevel: true,
      createdAt: true,
    },
  });

export const updateUser = async (id, data) => {
  const payload = { ...data };
  if (payload.password) {
    payload.password = await bcrypt.hash(payload.password, SALT_ROUNDS);
  }
  try {
    const updated = await prisma.user.update({
      where: { id },
      data: payload,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        classLevel: true,
      },
    });
    return updated;
  } catch (error) {
    if (error.code === 'P2025') {
      throw createHttpError(404, 'User not found');
    }
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    await prisma.user.delete({ where: { id } });
  } catch (error) {
    if (error.code === 'P2025') {
      throw createHttpError(404, 'User not found');
    }
    throw error;
  }
};
