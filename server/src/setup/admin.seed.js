import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

import { env } from '../config/env.js';
import { createUser, findUserByEmail, normalizeEmail } from '../models/user.repository.js';
import { log } from '../utils/logger.js';

export const seedAdminUser = async () => {
  const { name, email, password, role } = env.adminSeed;

  if (!email || !password || !name) {
    return;
  }

  const normalizedEmail = normalizeEmail(email);
  const existing = await findUserByEmail(normalizedEmail);

  if (existing) {
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await createUser({
    id: randomUUID(),
    name,
    email,
    emailNormalized: normalizedEmail,
    passwordHash,
    role: role || 'teacher',
    createdAt: new Date()
  });

  log(`Seeded admin account for ${email}`);
};
