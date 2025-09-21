import { getPostgresClient } from '../config/db.js';

const mapToken = (row) => ({
  id: row.id,
  userId: row.user_id,
  tokenHash: row.token_hash,
  type: row.type,
  metadata: row.metadata ?? {},
  expiresAt: row.expires_at,
  createdAt: row.created_at,
  usedAt: row.used_at
});

export const createUserToken = async ({ id, userId, tokenHash, type, metadata = {}, expiresAt }) => {
  const client = getPostgresClient();
  const { rows } = await client.query(
    `
      INSERT INTO user_tokens (id, user_id, token_hash, type, metadata, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, user_id, token_hash, type, metadata, expires_at, created_at, used_at
    `,
    [id, userId, tokenHash, type, metadata, expiresAt]
  );
  return mapToken(rows[0]);
};

export const findActiveTokenByHash = async ({ tokenHash, type }) => {
  const client = getPostgresClient();
  const { rows } = await client.query(
    `
      SELECT id, user_id, token_hash, type, metadata, expires_at, created_at, used_at
      FROM user_tokens
      WHERE token_hash = $1
        AND type = $2
        AND used_at IS NULL
        AND expires_at > NOW()
      LIMIT 1
    `,
    [tokenHash, type]
  );

  if (rows.length === 0) {
    return null;
  }

  return mapToken(rows[0]);
};

export const findTokenByHash = async ({ tokenHash, type }) => {
  const client = getPostgresClient();
  const { rows } = await client.query(
    `
      SELECT id, user_id, token_hash, type, metadata, expires_at, created_at, used_at
      FROM user_tokens
      WHERE token_hash = $1
        AND type = $2
      LIMIT 1
    `,
    [tokenHash, type]
  );

  if (rows.length === 0) {
    return null;
  }

  return mapToken(rows[0]);
};

export const markTokenAsUsed = async (id, usedAt = new Date()) => {
  const client = getPostgresClient();
  const { rows } = await client.query(
    `
      UPDATE user_tokens
      SET used_at = $2
      WHERE id = $1
      RETURNING id, user_id, token_hash, type, metadata, expires_at, created_at, used_at
    `,
    [id, usedAt]
  );

  if (rows.length === 0) {
    return null;
  }

  return mapToken(rows[0]);
};

export const deleteTokensForUserByType = async ({ userId, type, excludeTokenId }) => {
  const client = getPostgresClient();
  const params = [userId, type];
  let query = `DELETE FROM user_tokens WHERE user_id = $1 AND type = $2`;

  if (excludeTokenId) {
    query += ' AND id <> $3';
    params.push(excludeTokenId);
  }

  await client.query(query, params);
};

export const deleteTokenById = async (id) => {
  const client = getPostgresClient();
  await client.query(`DELETE FROM user_tokens WHERE id = $1`, [id]);
};

export const deleteExpiredTokens = async () => {
  const client = getPostgresClient();
  await client.query(`DELETE FROM user_tokens WHERE expires_at <= NOW()`);
};
