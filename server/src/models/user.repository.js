import { getPostgresClient } from '../config/db.js';

export const normalizeEmail = (email = '') => email.trim().toLowerCase();

const mapUser = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  createdAt: row.created_at ?? row.createdAt
});

export const createUser = async ({ id, name, email, emailNormalized, passwordHash, role, createdAt }) => {
  const client = getPostgresClient();
  const query = `
    INSERT INTO users (id, name, email, email_normalized, password_hash, role, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, name, email, role, created_at
  `;
  const { rows } = await client.query(query, [id, name, email, emailNormalized, passwordHash, role, createdAt]);
  return mapUser(rows[0]);
};

export const findUserByEmail = async (email) => {
  const client = getPostgresClient();
  const { rows } = await client.query(
    `SELECT id, name, email, email_normalized, password_hash, role, created_at
     FROM users WHERE email_normalized = $1 LIMIT 1`,
    [email]
  );
  if (rows.length === 0) {
    return null;
  }
  const [row] = rows;
  return { ...mapUser(row), passwordHash: row.password_hash };
};

export const findUserById = async (id) => {
  const client = getPostgresClient();
  const { rows } = await client.query(
    'SELECT id, name, email, role, created_at FROM users WHERE id = $1 LIMIT 1',
    [id]
  );
  if (rows.length === 0) {
    return null;
  }
  return mapUser(rows[0]);
};
