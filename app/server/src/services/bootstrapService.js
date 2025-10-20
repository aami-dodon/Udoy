import { UserStatus } from '@prisma/client';
import env from '../config/env.js';
import prisma from '../utils/prismaClient.js';
import logger from '../utils/logger.js';
import { ensureUserHasRole, normalizeEmail } from './userService.js';

export async function ensureDefaultAdmin() {
  const { defaultAdmin = {} } = env;
  const userId = typeof defaultAdmin.userId === 'string' ? defaultAdmin.userId.trim() : null;
  const email = normalizeEmail(defaultAdmin.email);

  if (!userId || !email) {
    throw new Error('DEFAULT_ADMIN_USER_ID and DEFAULT_ADMIN_EMAIL must be provided to bootstrap the admin account.');
  }

  const conflictingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (conflictingUser && conflictingUser.id !== userId) {
    throw new Error(
      'DEFAULT_ADMIN_EMAIL is already associated with a different user. Unable to bootstrap admin account.'
    );
  }

  const adminUser = await prisma.user.upsert({
    where: { id: userId },
    update: {
      email,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
    },
    create: {
      id: userId,
      email,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
    },
  });

  await ensureUserHasRole(adminUser.id, 'admin', { actorId: adminUser.id });

  logger.info('Default admin account ensured', { userId: adminUser.id, email: adminUser.email });

  return adminUser;
}

export default {
  ensureDefaultAdmin,
};
