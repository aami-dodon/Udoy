process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test-access-secret';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret';

import { test } from 'node:test';
import assert from 'node:assert/strict';

const { UserStatus } = await import('@prisma/client');
const { default: prisma } = await import('../../utils/prismaClient.js');
const { default: AppError } = await import('../../utils/appError.js');
const { signAccessToken } = await import('../../utils/jwt.js');
const { default: authenticate } = await import('../../middlewares/authenticate.js');
const { updateUserStatus } = await import('../userService.js');

test('deactivating a user revokes their sessions and blocks authenticated access', async (t) => {
  const originalUserFindUnique = prisma.user.findUnique;
  const originalUserUpdate = prisma.user.update;
  const originalSessionFindMany = prisma.session.findMany;
  const originalSessionUpdateMany = prisma.session.updateMany;
  const originalSessionFindUnique = prisma.session.findUnique;
  const originalAuditCreate = prisma.auditLog.create;

  t.after(() => {
    prisma.user.findUnique = originalUserFindUnique;
    prisma.user.update = originalUserUpdate;
    prisma.session.findMany = originalSessionFindMany;
    prisma.session.updateMany = originalSessionUpdateMany;
    prisma.session.findUnique = originalSessionFindUnique;
    prisma.auditLog.create = originalAuditCreate;
  });

  const sessionRecord = {
    id: 'sess_1',
    userId: 'user_1',
    revokedAt: null,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    user: { id: 'user_1', status: UserStatus.ACTIVE },
  };

  prisma.user.findUnique = async () => ({ status: UserStatus.ACTIVE });
  prisma.user.update = async ({ data }) => ({ id: 'user_1', status: data.status });
  prisma.session.findMany = async () => [sessionRecord];
  prisma.session.updateMany = async ({ data }) => {
    sessionRecord.revokedAt = data.revokedAt;
    return { count: 1 };
  };
  prisma.session.findUnique = async () => sessionRecord;
  prisma.auditLog.create = async () => null;

  await updateUserStatus('user_1', UserStatus.INACTIVE, { actorId: 'admin_1' });

  const accessToken = signAccessToken({ sub: sessionRecord.userId, sid: sessionRecord.id });

  const req = {
    headers: { authorization: `Bearer ${accessToken}` },
    cookies: {},
    signedCookies: {},
  };

  let error;
  await authenticate(req, {}, (err) => {
    error = err;
  });

  assert.ok(error instanceof AppError, 'Expected authenticate to propagate an AppError');
  assert.equal(error.code, 'SESSION_REVOKED');
  assert.ok(sessionRecord.revokedAt instanceof Date, 'session was not revoked during status update');
});
