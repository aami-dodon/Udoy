import type { UserSummary } from './user';

export interface AccountProfileUpdateResponse {
  user: UserSummary;
  emailChangePending: boolean;
  message: string;
}
