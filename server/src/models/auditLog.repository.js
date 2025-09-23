import { getPrismaClient } from '../config/db.js';

const mapAuditLog = (log) => ({
  id: log.id,
  actorId: log.actorId,
  targetUserId: log.targetUserId,
  action: log.action,
  metadata: log.metadata ?? {},
  createdAt: log.createdAt
});

export const createAuditLog = async ({
  id,
  actorId,
  targetUserId,
  action,
  metadata = {},
  createdAt = new Date()
}) => {
  const prisma = getPrismaClient();
  const log = await prisma.auditLog.create({
    data: {
      id,
      actorId,
      targetUserId,
      action,
      metadata,
      createdAt
    }
  });

  return mapAuditLog(log);
};

export const findAuditLogsByTargetUser = async (targetUserId) => {
  const prisma = getPrismaClient();
  const logs = await prisma.auditLog.findMany({
    where: { targetUserId },
    orderBy: { createdAt: 'desc' }
  });

  return logs.map(mapAuditLog);
};
