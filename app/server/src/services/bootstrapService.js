import { UserStatus } from '@prisma/client';
import env from '../config/env.js';
import prisma from '../utils/prismaClient.js';
import logger from '../utils/logger.js';
import { hashPassword } from '../utils/password.js';
import { ensureUserHasRole, normalizeEmail } from './userService.js';

export async function ensureDefaultAdmin() {
  const { defaultAdmin = {} } = env;
  const email = normalizeEmail(defaultAdmin.email);
  const password = typeof defaultAdmin.password === 'string' ? defaultAdmin.password : null;

  if (!email) {
    throw new Error('DEFAULT_ADMIN_EMAIL must be provided to bootstrap the admin account.');
  }

  if (!password) {
    throw new Error('DEFAULT_ADMIN_PASSWORD must be provided to bootstrap the admin account.');
  }

  const passwordHash = await hashPassword(password);

  const adminUser = await prisma.user.upsert({
    where: { email },
    update: {
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
    },
    create: {
      email,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
    },
  });

  await ensureUserHasRole(adminUser.id, 'admin', { actorId: adminUser.id });

  logger.info('Default admin account ensured', { userId: adminUser.id, email: adminUser.email });

  return adminUser;
}

export default {
  ensureDefaultAdmin,
};
