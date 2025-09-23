import type { UserSummary } from './user';

export interface AccountUpdateResponse {
  user: UserSummary;
  emailChangePending: boolean;
  message: string;
}
