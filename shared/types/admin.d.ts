import type { UserSummary } from './user';

export interface AdminUserCollectionResponse {
  users: UserSummary[];
}

export interface AdminUserResponse {
  user: UserSummary;
  message?: string;
}
