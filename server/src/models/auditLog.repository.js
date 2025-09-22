import { getPostgresClient } from '../config/db.js';

const mapAuditLog = (row) => ({
  id: row.id,
  actorId: row.actor_id,
  targetUserId: row.target_user_id,
  action: row.action,
  metadata: row.metadata ?? {},
  createdAt: row.created_at
});

export const createAuditLog = async ({
  id,
  actorId,
  targetUserId,
  action,
  metadata = {},
  createdAt = new Date()
}) => {
  const client = getPostgresClient();
  const { rows } = await client.query(
    `
      INSERT INTO audit_logs (id, actor_id, target_user_id, action, metadata, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, actor_id, target_user_id, action, metadata, created_at
    `,
    [id, actorId ?? null, targetUserId ?? null, action, metadata, createdAt]
  );

  return mapAuditLog(rows[0]);
};

export const findAuditLogsByTargetUser = async (targetUserId) => {
  const client = getPostgresClient();
  const { rows } = await client.query(
    `
      SELECT id, actor_id, target_user_id, action, metadata, created_at
      FROM audit_logs
      WHERE target_user_id = $1
      ORDER BY created_at DESC
    `,
    [targetUserId]
  );

  return rows.map(mapAuditLog);
};
