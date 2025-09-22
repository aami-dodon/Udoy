import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

import { env } from '../config/env.js';
import {
  createUser,
  findUserByEmail,
  normalizeEmail,
  updateUserByEmailNormalized
} from '../models/user.repository.js';
import { logInfo } from '../utils/logger.js';

export const seedAdminUser = async () => {
  const { name, email, password, role } = env.adminSeed;

  if (!email || !password || !name) {
    return;
  }

  const normalizedEmail = normalizeEmail(email);
  const existing = await findUserByEmail(normalizedEmail);

  const passwordHash = await bcrypt.hash(password, 10);
  const targetRole = role || 'admin';

  const now = new Date();

  if (existing) {
    await updateUserByEmailNormalized({
      emailNormalized: normalizedEmail,
      name,
      role: targetRole,
      passwordHash,
      passwordUpdatedAt: now,
      isVerified: true,
      isActive: true
    });
    logInfo('Refreshed admin account', { email });
    return;
  }

  await createUser({
    id: randomUUID(),
    name,
    email,
    emailNormalized: normalizedEmail,
    passwordHash,
    role: targetRole,
    isVerified: true,
    isActive: true,
    createdAt: now,
    passwordUpdatedAt: now
  });

  logInfo('Seeded admin account', { email });
};
