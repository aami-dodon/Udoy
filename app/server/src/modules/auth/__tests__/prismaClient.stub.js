export class PrismaClient {
  constructor() {}
}

export const AuditEventType = {
  PASSWORD_RESET_REQUESTED: 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET_COMPLETED: 'PASSWORD_RESET_COMPLETED',
  EMAIL_VERIFICATION_SENT: 'EMAIL_VERIFICATION_SENT',
  EMAIL_VERIFIED: 'EMAIL_VERIFIED',
  GUARDIAN_INVITED: 'GUARDIAN_INVITED',
  GUARDIAN_APPROVED: 'GUARDIAN_APPROVED',
  SESSION_ISSUED: 'SESSION_ISSUED',
  SESSION_REVOKED: 'SESSION_REVOKED',
  TOKEN_ROTATED: 'TOKEN_ROTATED',
};

export const VerificationTokenType = {
  PASSWORD_RESET: 'PASSWORD_RESET',
  EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
  GUARDIAN_APPROVAL: 'GUARDIAN_APPROVAL',
};

export const GuardianLinkStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
};

export const GuardianRelationship = {
  COACH: 'COACH',
};

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  PENDING: 'PENDING',
};

export default {
  PrismaClient,
  AuditEventType,
  VerificationTokenType,
  GuardianLinkStatus,
  GuardianRelationship,
  UserStatus,
};
