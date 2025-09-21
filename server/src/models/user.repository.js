import { getPostgresClient } from '../config/db.js';

export const normalizeEmail = (email = '') => email.trim().toLowerCase();

const mapUser = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  isVerified: row.is_verified ?? row.isVerified,
  isActive: row.is_active ?? row.isActive,
  createdAt: row.created_at ?? row.createdAt,
  updatedAt: row.updated_at ?? row.updatedAt,
  deletedAt: row.deleted_at ?? row.deletedAt,
  passwordUpdatedAt: row.password_updated_at ?? row.passwordUpdatedAt
});

const baseSelectFields = `
  id,
  name,
  email,
  email_normalized,
  role,
  is_verified,
  is_active,
  created_at,
  updated_at,
  deleted_at,
  password_hash,
  password_updated_at
`;

const selectUsers = `SELECT ${baseSelectFields} FROM users`;

const buildUpdateClauses = (fields, startIndex = 2) => {
  const updates = [];
  const values = [];
  let index = startIndex;

  const push = (clause, value) => {
    updates.push(`${clause} $${index}`);
    values.push(value);
    index += 1;
  };

  if (Object.prototype.hasOwnProperty.call(fields, 'name')) {
    push('name =', fields.name);
  }

  if (Object.prototype.hasOwnProperty.call(fields, 'email') && Object.prototype.hasOwnProperty.call(fields, 'emailNormalized')) {
    push('email =', fields.email);
    push('email_normalized =', fields.emailNormalized);
  }

  if (Object.prototype.hasOwnProperty.call(fields, 'role')) {
    push('role =', fields.role);
  }

  if (Object.prototype.hasOwnProperty.call(fields, 'passwordHash')) {
    push('password_hash =', fields.passwordHash);
  }

  if (Object.prototype.hasOwnProperty.call(fields, 'isVerified')) {
    push('is_verified =', fields.isVerified);
  }

  if (Object.prototype.hasOwnProperty.call(fields, 'isActive')) {
    push('is_active =', fields.isActive);
  }

  if (Object.prototype.hasOwnProperty.call(fields, 'passwordUpdatedAt')) {
    push('password_updated_at =', fields.passwordUpdatedAt);
  }

  if (Object.prototype.hasOwnProperty.call(fields, 'deletedAt')) {
    push('deleted_at =', fields.deletedAt);
  }

  return { updates, values };
};

export const createUser = async ({
  id,
  name,
  email,
  emailNormalized,
  passwordHash,
  role,
  isVerified = false,
  isActive = true,
  createdAt,
  passwordUpdatedAt = createdAt
}) => {
  const client = getPostgresClient();
  const query = `
    INSERT INTO users (
      id,
      name,
      email,
      email_normalized,
      password_hash,
      role,
      is_verified,
      is_active,
      created_at,
      updated_at,
      password_updated_at,
      deleted_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NULL)
    RETURNING ${baseSelectFields}
  `;

  const updatedAt = createdAt;

  const { rows } = await client.query(query, [
    id,
    name,
    email,
    emailNormalized,
    passwordHash,
    role,
    isVerified,
    isActive,
    createdAt,
    updatedAt,
    passwordUpdatedAt
  ]);

  return mapUser(rows[0]);
};

export const updateUserByEmailNormalized = async ({
  emailNormalized,
  name,
  role,
  passwordHash,
  passwordUpdatedAt,
  isVerified,
  isActive
}) => {
  const client = getPostgresClient();

  const { updates, values } = buildUpdateClauses(
    { name, role, passwordHash, passwordUpdatedAt, isVerified, isActive },
    2
  );

  if (updates.length === 0) {
    return null;
  }

  const query = `
    UPDATE users
    SET ${updates.join(', ')}, updated_at = NOW()
    WHERE email_normalized = $1 AND deleted_at IS NULL
    RETURNING ${baseSelectFields}
  `;

  const { rows } = await client.query(query, [emailNormalized, ...values]);

  if (rows.length === 0) {
    return null;
  }

  return mapUser(rows[0]);
};

export const updateUserById = async (id, fields) => {
  const client = getPostgresClient();
  const { updates, values } = buildUpdateClauses(fields, 2);

  if (updates.length === 0) {
    return findUserById(id);
  }

  const query = `
    UPDATE users
    SET ${updates.join(', ')}, updated_at = NOW()
    WHERE id = $1 AND deleted_at IS NULL
    RETURNING ${baseSelectFields}
  `;

  const { rows } = await client.query(query, [id, ...values]);

  if (rows.length === 0) {
    return null;
  }

  return mapUser(rows[0]);
};

export const markUserVerified = async (id) =>
  updateUserById(id, { isVerified: true });

export const setUserActiveState = async (id, isActive) =>
  updateUserById(id, { isActive });

export const softDeleteUser = async (id, deletedAt = new Date()) =>
  updateUserById(id, { deletedAt, isActive: false });

export const findUserByEmail = async (email) => {
  const client = getPostgresClient();
  const { rows } = await client.query(
    `${selectUsers} WHERE email_normalized = $1 AND deleted_at IS NULL LIMIT 1`,
    [email]
  );

  if (rows.length === 0) {
    return null;
  }

  const [row] = rows;
  return {
    ...mapUser(row),
    emailNormalized: row.email_normalized,
    passwordHash: row.password_hash
  };
};

export const findUserById = async (id, { includeDeleted = false, includePasswordHash = false } = {}) => {
  const client = getPostgresClient();

  const filter = includeDeleted ? '' : 'AND deleted_at IS NULL';
  const { rows } = await client.query(
    `${selectUsers} WHERE id = $1 ${filter} LIMIT 1`,
    [id]
  );

  if (rows.length === 0) {
    return null;
  }

  const user = mapUser(rows[0]);
  if (includePasswordHash) {
    return {
      ...user,
      passwordHash: rows[0].password_hash,
      emailNormalized: rows[0].email_normalized
    };
  }
  return user;
};

export const listUsers = async ({ includeDeleted = false } = {}) => {
  const client = getPostgresClient();
  const filter = includeDeleted ? '' : 'WHERE deleted_at IS NULL';
  const { rows } = await client.query(
    `${selectUsers} ${filter} ORDER BY created_at DESC`
  );
  return rows.map(mapUser);
};
