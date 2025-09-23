import type { UUID } from './common';
import type { UserSummary } from './user';

export interface AuthTokenPayload {
  sub: UUID;
  role: string;
}

export interface SignupResponse {
  user: UserSummary;
  requiresVerification: boolean;
  supportEmail?: string;
}

export interface LoginResponse {
  user: UserSummary;
  token: string;
}

export interface AuthenticatedUserResponse extends UserSummary {}

export interface VerifyEmailResult {
  user: UserSummary;
  message: string;
}

export interface ForgotPasswordResult {
  message: string;
}

export interface ResetPasswordResult {
  message: string;
}

export interface ResendVerificationResponse {
  message: string;
  supportEmail?: string;
}
