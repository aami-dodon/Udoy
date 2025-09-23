import bcrypt from 'bcrypt';
import { prisma } from '../../config/database.js';
import { signToken } from '../../utils/jwt.js';
import { createHttpError } from '../../utils/errors.js';

const SALT_ROUNDS = 10;

/**
 * @param {Object} payload
 * @param {string} payload.email
 * @param {string} payload.password
 * @param {string} payload.firstName
 * @param {string} payload.lastName
 * @param {'student'|'teacher'|'admin'} payload.role
 * @param {number=} payload.classLevel
 */
export const registerUser = async ({ email, password, firstName, lastName, role, classLevel }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw createHttpError(409, 'Email already in use');
  }
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      firstName,
      lastName,
      role,
      classLevel: role === 'student' ? classLevel ?? 4 : null,
    },
  });
  return user;
};

/**
 * @param {string} email
 * @param {string} password
 */
export const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw createHttpError(401, 'Invalid credentials');
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw createHttpError(401, 'Invalid credentials');
  }
  const token = signToken({ id: user.id, role: user.role, email: user.email });
  return { user, token };
};
