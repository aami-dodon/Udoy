import crypto from 'node:crypto';
import { AuditEventType, UserStatus, VerificationTokenType } from '@prisma/client';
import env from '../config/env.js';
import prisma from '../utils/prismaClient.js';
import logger from '../utils/logger.js';
import AppError from '../utils/appError.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { parseDuration, addSeconds, secondsUntil } from '../utils/duration.js';
import { logAuditEvent } from './auditService.js';
import { getUserAuthPayload } from './userService.js';

const testOverrides = {
  generateVerificationToken: null,
};

const testSpies = {
  generateVerificationToken: [],
};

export function __setGenerateVerificationToken(impl) {
  testOverrides.generateVerificationToken = typeof impl === 'function' ? impl : null;
}

export function __resetTokenServiceMocks() {
  testOverrides.generateVerificationToken = null;
  testSpies.generateVerificationToken = [];
}

export function __getGenerateVerificationTokenCalls() {
  return [...testSpies.generateVerificationToken];
}

const accessTtlSeconds = parseDuration(env.jwt?.access?.expiresIn, 15 * 60);
const refreshTtlSeconds = parseDuration(env.jwt?.refresh?.expiresIn, 7 * 24 * 60 * 60);

function generateRandomToken(bytes = 48) {
  return crypto.randomBytes(bytes).toString('hex');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function buildSessionId() {
  return crypto.randomUUID();
}

function buildAccessPayload(basePayload, sessionId) {
  return {
    ...basePayload,
    sid: sessionId,
  };
}

export async function issueSessionTokens(user, { userAgent, ipAddress, replaceSessionId } = {}) {
  const authPayload = await getUserAuthPayload(user.id ?? user?.userId ?? user?.email, {
    includeSensitive: false,
  });

  if (!authPayload) {
    throw AppError.unauthorized('Unable to resolve user permissions', {
      code: 'USER_CONTEXT_MISSING',
    });
  }

  const sessionId = buildSessionId();
  const accessPayload = buildAccessPayload(authPayload, sessionId);
  const accessToken = signAccessToken(accessPayload);
  const refreshToken = signRefreshToken({
    sub: authPayload.sub,
    sid: sessionId,
    roles: authPayload.roles,
  });
  const refreshTokenHash = hashToken(refreshToken);
  const expiresAt = addSeconds(new Date(), refreshTtlSeconds);

  const session = await prisma.session.create({
    data: {
      id: sessionId,
      userId: authPayload.sub,
      refreshTokenHash,
      userAgent,
      ipAddress,
      expiresAt,
    },
  });

  if (replaceSessionId) {
    try {
      await prisma.session.update({
        where: { id: replaceSessionId },
        data: {
          revokedAt: new Date(),
          replacedBy: { connect: { id: session.id } },
        },
      });
      await logAuditEvent({
        actorId: authPayload.sub,
        eventType: AuditEventType.TOKEN_ROTATED,
        resource: 'session',
        resourceId: replaceSessionId,
        metadata: { replacementId: session.id },
      });
    } catch (error) {
      logger.warn('Failed to link replacement session', {
        error: error.message,
        sessionId: replaceSessionId,
      });
    }
  }

  await logAuditEvent({
    actorId: authPayload.sub,
    eventType: AuditEventType.SESSION_ISSUED,
    resource: 'session',
    resourceId: session.id,
    metadata: {
      ipAddress,
      userAgent,
      expiresAt,
    },
  });

  return {
    accessToken,
    refreshToken,
    accessTokenExpiresIn: accessTtlSeconds,
    refreshTokenExpiresIn: secondsUntil(expiresAt),
    session,
    authPayload: accessPayload,
  };
}

export async function rotateSessionTokens(refreshToken, { userAgent, ipAddress } = {}) {
  if (!refreshToken) {
    throw AppError.unauthorized('Refresh token is required', {
      code: 'REFRESH_TOKEN_REQUIRED',
    });
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw AppError.unauthorized('Refresh token could not be verified', {
      code: 'REFRESH_TOKEN_INVALID',
      cause: error,
    });
  }

  if (!decoded?.sid) {
    throw AppError.unauthorized('Refresh token is missing a session identifier', {
      code: 'REFRESH_TOKEN_SID_MISSING',
    });
  }

  const existingSession = await prisma.session.findUnique({
    where: { id: decoded.sid },
    include: { user: true },
  });

  if (!existingSession || existingSession.revokedAt) {
    throw AppError.unauthorized('Refresh token is no longer valid', {
      code: 'REFRESH_TOKEN_REVOKED',
    });
  }

  const incomingHash = hashToken(refreshToken);
  if (existingSession.refreshTokenHash !== incomingHash) {
    await prisma.session.update({
      where: { id: existingSession.id },
      data: { revokedAt: new Date() },
    });
    await logAuditEvent({
      actorId: existingSession.userId,
      eventType: AuditEventType.SESSION_REVOKED,
      resource: 'session',
      resourceId: existingSession.id,
      metadata: { reason: 'token_mismatch' },
    });
    throw AppError.unauthorized('Refresh token does not match stored session', {
      code: 'REFRESH_TOKEN_MISMATCH',
    });
  }

  if (existingSession.expiresAt <= new Date()) {
    await prisma.session.update({
      where: { id: existingSession.id },
      data: { revokedAt: new Date() },
    });
    await logAuditEvent({
      actorId: existingSession.userId,
      eventType: AuditEventType.SESSION_REVOKED,
      resource: 'session',
      resourceId: existingSession.id,
      metadata: { reason: 'expired' },
    });
    throw AppError.unauthorized('Refresh token has expired', {
      code: 'REFRESH_TOKEN_EXPIRED',
    });
  }

  return issueSessionTokens(existingSession.user, {
    userAgent,
    ipAddress,
    replaceSessionId: existingSession.id,
  });
}

export async function revokeSession(sessionId, actorId, reason = 'user_logout') {
  if (!sessionId) {
    return null;
  }

  try {
    const session = await prisma.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });

    await logAuditEvent({
      actorId,
      eventType: AuditEventType.SESSION_REVOKED,
      resource: 'session',
      resourceId: sessionId,
      metadata: { reason },
    });

    return session;
  } catch (error) {
    logger.warn('Attempted to revoke unknown session', {
      sessionId,
      error: error.message,
    });
    return null;
  }
}

export async function revokeAllSessionsForUser(userId, { actorId, reason = 'user_status_change' } = {}) {
  if (!userId) {
    return { count: 0, sessionIds: [] };
  }

  const activeSessions = await prisma.session.findMany({
    where: { userId, revokedAt: null },
    select: { id: true },
  });

  if (!activeSessions.length) {
    return { count: 0, sessionIds: [] };
  }

  const sessionIds = activeSessions.map((session) => session.id);
  const now = new Date();

  await prisma.session.updateMany({
    where: { id: { in: sessionIds } },
    data: { revokedAt: now },
  });

  await Promise.all(
    sessionIds.map((sessionId) =>
      logAuditEvent({
        actorId,
        eventType: AuditEventType.SESSION_REVOKED,
        resource: 'session',
        resourceId: sessionId,
        metadata: { reason },
      })
    )
  );

  return { count: sessionIds.length, sessionIds };
}

export async function ensureSessionActive(sessionId, { userId, requireActiveUser = true } = {}) {
  if (!sessionId) {
    if (!userId) {
      throw AppError.unauthorized('Session identifier is required', {
        code: 'SESSION_IDENTIFIER_REQUIRED',
      });
    }

    if (!requireActiveUser) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { status: true },
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw AppError.unauthorized('User account is inactive', {
        code: 'USER_INACTIVE',
      });
    }

    return null;
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: { select: { id: true, status: true } } },
  });

  if (!session) {
    throw AppError.unauthorized('Session could not be found', {
      code: 'SESSION_NOT_FOUND',
    });
  }

  if (session.revokedAt) {
    throw AppError.unauthorized('Session has been revoked', {
      code: 'SESSION_REVOKED',
    });
  }

  if (session.expiresAt <= new Date()) {
    await revokeSession(session.id, session.userId, 'session_expired');
    throw AppError.unauthorized('Session has expired', {
      code: 'SESSION_EXPIRED',
    });
  }

  if (requireActiveUser) {
    const status = session.user?.status;

    if (status !== UserStatus.ACTIVE) {
      await revokeSession(session.id, session.userId, 'user_inactive');
      throw AppError.unauthorized('User account is inactive', {
        code: 'USER_INACTIVE',
      });
    }
  }

  return session;
}

export async function generateVerificationToken(userId, type, {
  expiresInSeconds = 60 * 60 * 24,
  actorId = null,
  metadata = null,
} = {}) {
  testSpies.generateVerificationToken.push([userId, type, { expiresInSeconds, actorId, metadata }]);

  const override = testOverrides.generateVerificationToken;
  if (override) {
    return override(userId, type, { expiresInSeconds, actorId, metadata });
  }

  if (!userId || !type) {
    throw AppError.badRequest('Unable to create verification token', {
      code: 'VERIFICATION_TOKEN_PARAMS_MISSING',
    });
  }

  const plainToken = generateRandomToken(32);
  const tokenHash = hashToken(plainToken);
  const expiresAt = addSeconds(new Date(), expiresInSeconds);

  const tokenRecord = await prisma.verificationToken.create({
    data: {
      userId,
      type,
      tokenHash,
      expiresAt,
      metadata,
    },
  });

  await logAuditEvent({
    actorId,
    eventType:
      type === VerificationTokenType.PASSWORD_RESET
        ? AuditEventType.PASSWORD_RESET_REQUESTED
        : type === VerificationTokenType.EMAIL_VERIFICATION
        ? AuditEventType.EMAIL_VERIFICATION_SENT
        : AuditEventType.GUARDIAN_INVITED,
    resource: 'verification-token',
    resourceId: tokenRecord.id,
    metadata: { type, expiresAt, metadata },
  });

  return { token: plainToken, record: tokenRecord };
}

export async function consumeVerificationToken(token, type) {
  if (!token || !type) {
    throw AppError.badRequest('Invalid verification token payload', {
      code: 'VERIFICATION_TOKEN_INVALID',
    });
  }

  const tokenHash = hashToken(token);
  const record = await prisma.verificationToken.findUnique({
    where: { type_tokenHash: { type, tokenHash } },
  });

  if (!record || record.consumedAt || record.expiresAt <= new Date()) {
    throw AppError.unauthorized('Verification token is invalid or expired', {
      code: 'VERIFICATION_TOKEN_EXPIRED',
    });
  }

  await prisma.verificationToken.update({
    where: { id: record.id },
    data: { consumedAt: new Date() },
  });

  return record;
}

export { hashToken };

export default {
  issueSessionTokens,
  rotateSessionTokens,
  revokeSession,
  revokeAllSessionsForUser,
  ensureSessionActive,
  generateVerificationToken,
  consumeVerificationToken,
};
