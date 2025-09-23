import type { UUID, ISODateString } from './common';

export type UserRole = 'student' | 'teacher' | 'admin';

export interface UserTimestamps {
  createdAt: ISODateString;
  updatedAt: ISODateString;
  deletedAt: ISODateString | null;
  passwordUpdatedAt: ISODateString | null;
}

export interface UserSummary extends UserTimestamps {
  id: UUID;
  name: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
}

export interface AuthenticatedUser extends UserSummary {
  /** Lowercased email maintained server-side for lookups. */
  emailNormalized?: string;
}
