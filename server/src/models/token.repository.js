import { getPrismaClient } from '../config/db.js';

const mapToken = (token) => ({
  id: token.id,
  userId: token.userId,
  tokenHash: token.tokenHash,
  type: token.type,
  metadata: token.metadata ?? {},
  expiresAt: token.expiresAt,
  createdAt: token.createdAt,
  usedAt: token.usedAt
});

export const createUserToken = async ({
  id,
  userId,
  tokenHash,
  type,
  metadata = {},
  expiresAt
}) => {
  const prisma = getPrismaClient();
  const token = await prisma.userToken.create({
    data: {
      id,
      userId,
      tokenHash,
      type,
      metadata,
      expiresAt
    }
  });

  return mapToken(token);
};

export const findActiveTokenByHash = async ({ tokenHash, type }) => {
  const prisma = getPrismaClient();
  const token = await prisma.userToken.findFirst({
    where: {
      tokenHash,
      type,
      usedAt: null,
      expiresAt: {
        gt: new Date()
      }
    }
  });

  return token ? mapToken(token) : null;
};

export const findTokenByHash = async ({ tokenHash, type }) => {
  const prisma = getPrismaClient();
  const token = await prisma.userToken.findFirst({
    where: {
      tokenHash,
      type
    }
  });

  return token ? mapToken(token) : null;
};

export const markTokenAsUsed = async (id, usedAt = new Date()) => {
  const prisma = getPrismaClient();
  try {
    const token = await prisma.userToken.update({
      where: { id },
      data: { usedAt }
    });
    return mapToken(token);
  } catch (error) {
    if (error.code === 'P2025') {
      return null;
    }
    throw error;
  }
};

export const deleteTokensForUserByType = async ({ userId, type, excludeTokenId }) => {
  const prisma = getPrismaClient();
  await prisma.userToken.deleteMany({
    where: {
      userId,
      type,
      ...(excludeTokenId ? { id: { not: excludeTokenId } } : {})
    }
  });
};

export const deleteTokenById = async (id) => {
  const prisma = getPrismaClient();
  await prisma.userToken.deleteMany({ where: { id } });
};

export const deleteExpiredTokens = async () => {
  const prisma = getPrismaClient();
  await prisma.userToken.deleteMany({
    where: {
      expiresAt: {
        lte: new Date()
      }
    }
  });
};
