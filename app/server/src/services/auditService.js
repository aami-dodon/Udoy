import prisma from '../utils/prismaClient.js';
import logger from '../utils/logger.js';

export async function logAuditEvent({
  actorId = null,
  eventType,
  resource,
  resourceId = null,
  metadata = null,
}) {
  if (!eventType || !resource) {
    logger.warn('Audit event skipped due to missing eventType or resource', {
      eventType,
      resource,
    });
    return null;
  }

  try {
    return await prisma.auditLog.create({
      data: {
        actorId,
        eventType,
        resource,
        resourceId,
        metadata,
      },
    });
  } catch (error) {
    logger.error('Failed to persist audit event', {
      error: error.message,
      eventType,
      resource,
      resourceId,
    });
    return null;
  }
}

export default {
  logAuditEvent,
};
