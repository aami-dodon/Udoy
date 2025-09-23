-- Automigrate existing schema to Prisma-backed structure

DO $$
BEGIN
  CREATE TYPE "Role" AS ENUM ('student', 'teacher', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "TokenType" AS ENUM ('verify_email', 'reset_password');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Ensure users table exists
CREATE TABLE IF NOT EXISTS "users" (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  email_normalized TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role "Role" NOT NULL DEFAULT 'student'::"Role",
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  password_updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

-- Normalize existing role values only when legacy text column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'users'
      AND column_name = 'role'
      AND data_type = 'text'
  ) THEN
    UPDATE "users"
    SET role = LOWER(COALESCE(role::text, 'student'))
    WHERE role IS NOT NULL;

    ALTER TABLE "users"
      ALTER COLUMN role TYPE "Role" USING
        CASE
          WHEN role IS NULL THEN 'student'::"Role"
          ELSE LOWER(role)::"Role"
        END;
  END IF;
END $$;

ALTER TABLE "users"
  ALTER COLUMN role SET DEFAULT 'student'::"Role";
ALTER TABLE "users" ALTER COLUMN role SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN is_verified SET DEFAULT FALSE;
ALTER TABLE "users" ALTER COLUMN is_verified SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN is_active SET DEFAULT TRUE;
ALTER TABLE "users" ALTER COLUMN is_active SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN email SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN email_normalized SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN password_hash SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN updated_at SET DEFAULT NOW();
ALTER TABLE "users" ALTER COLUMN created_at SET DEFAULT NOW();

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "users" (email);
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_normalized_idx" ON "users" (email_normalized);

-- User tokens table & enum
CREATE TABLE IF NOT EXISTS "user_tokens" (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES "users" (id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  type "TokenType" NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  used_at TIMESTAMPTZ
);

ALTER TABLE "user_tokens"
  ALTER COLUMN type TYPE "TokenType" USING type::text::"TokenType";
ALTER TABLE "user_tokens" ALTER COLUMN metadata SET DEFAULT '{}'::jsonb;
ALTER TABLE "user_tokens" ALTER COLUMN metadata TYPE JSONB USING metadata::jsonb;
ALTER TABLE "user_tokens" ALTER COLUMN expires_at SET NOT NULL;
ALTER TABLE "user_tokens" ALTER COLUMN created_at SET DEFAULT NOW();

CREATE UNIQUE INDEX IF NOT EXISTS "user_tokens_token_hash_idx" ON "user_tokens" (token_hash);
CREATE INDEX IF NOT EXISTS "user_tokens_user_id_idx" ON "user_tokens" (user_id);
CREATE INDEX IF NOT EXISTS "user_tokens_expires_at_idx" ON "user_tokens" (expires_at);

-- Audit log table
CREATE TABLE IF NOT EXISTS "audit_logs" (
  id UUID PRIMARY KEY,
  actor_id UUID,
  target_user_id UUID,
  action TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT audit_logs_actor_fk FOREIGN KEY (actor_id) REFERENCES "users" (id) ON DELETE SET NULL,
  CONSTRAINT audit_logs_target_fk FOREIGN KEY (target_user_id) REFERENCES "users" (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "audit_logs_actor_id_idx" ON "audit_logs" (actor_id);
CREATE INDEX IF NOT EXISTS "audit_logs_target_user_id_idx" ON "audit_logs" (target_user_id);
CREATE INDEX IF NOT EXISTS "audit_logs_created_at_idx" ON "audit_logs" (created_at);
