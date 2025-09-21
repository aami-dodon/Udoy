import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

import { env } from '../config/env.js';
import {
  createUser,
  findUserByEmail,
  normalizeEmail,
  updateUserByEmailNormalized
} from '../models/user.repository.js';
import { log } from '../utils/logger.js';

export const seedAdminUser = async () => {
  const { name, email, password, role } = env.adminSeed;

  if (!email || !password || !name) {
    return;
  }

  const normalizedEmail = normalizeEmail(email);
  const existing = await findUserByEmail(normalizedEmail);

  const passwordHash = await bcrypt.hash(password, 10);
  const targetRole = role || 'admin';

  if (existing) {
    await updateUserByEmailNormalized({
      emailNormalized: normalizedEmail,
      name,
      role: targetRole,
      passwordHash
    });
    log(`Refreshed admin account for ${email}`);
    return;
  }

  await createUser({
    id: randomUUID(),
    name,
    email,
    emailNormalized: normalizedEmail,
    passwordHash,
    role: targetRole,
    createdAt: new Date()
  });

  log(`Seeded admin account for ${email}`);
};
