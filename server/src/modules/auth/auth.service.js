import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

import { generateToken } from '../../utils/jwt.js';
import { ApplicationError } from '../../utils/errors.js';
import { ROLES } from '../../../../shared/constants/index.js';
import { createUser, findUserByEmail, findUserById, normalizeEmail } from '../../models/user.repository.js';

const allowedSignupRoles = new Set([ROLES.STUDENT, ROLES.TEACHER]);

const assertValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApplicationError('Invalid email format', 400);
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

  const token = generateToken({ sub: user.id, role: user.role });
  return { user, token };
};

export const login = async ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);
  assertValidEmail(normalizedEmail);
  const userRecord = await findUserByEmail(normalizedEmail);

  if (!userRecord) {
    throw new ApplicationError('Invalid email or password', 401);
  }

  const passwordMatches = await bcrypt.compare(password, userRecord.passwordHash);

  if (!passwordMatches) {
    throw new ApplicationError('Invalid email or password', 401);
  }

  const user = userRecord;
  const token = generateToken({ sub: user.id, role: user.role });

  return { user, token };
};

export const getUserProfile = async (userId) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new ApplicationError('User not found', 404);
  }

  return user;
};
