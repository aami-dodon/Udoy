import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { AuditEventType } from '@prisma/client';
import { requestPasswordReset } from '../auth.controller.js';
import {
  __setGetUserByEmail,
  __resetUserServiceMocks,
} from '../../../services/userService.js';
import {
  __setGenerateVerificationToken,
  __resetTokenServiceMocks,
  __getGenerateVerificationTokenCalls,
} from '../../../services/tokenService.js';
import {
  __setSendPasswordResetEmail,
  __resetEmailServiceMocks,
  __getSendPasswordResetEmailCalls,
} from '../../../services/emailService.js';
import {
  __setLogAuditEvent,
  __resetAuditServiceMocks,
  __getLogAuditEventCalls,
} from '../../../services/auditService.js';

function createMockResponse() {
  return {
    jsonPayload: null,
    json(payload) {
      this.jsonPayload = payload;
      return payload;
    },
  };
}

beforeEach(() => {
  __resetUserServiceMocks();
  __resetTokenServiceMocks();
  __resetEmailServiceMocks();
  __resetAuditServiceMocks();
});

test('dispatches reset instructions for verified users', async () => {
  const req = { body: { email: 'verified@example.com' } };
  const res = createMockResponse();
  const nextCalls = [];
  const next = (...args) => nextCalls.push(args);

  __setGetUserByEmail(async () => ({
    id: 'user-1',
    email: 'verified@example.com',
    firstName: 'Veri',
    isEmailVerified: true,
  }));

  __setGenerateVerificationToken(async () => ({ token: 'reset-token' }));
  __setSendPasswordResetEmail(async () => undefined);

  await requestPasswordReset(req, res, next);

  assert.deepEqual(res.jsonPayload, {
    status: 'success',
    message: 'If the account exists, password reset instructions will be sent.',
  });
  assert.strictEqual(__getGenerateVerificationTokenCalls().length, 1);
  assert.strictEqual(__getSendPasswordResetEmailCalls().length, 1);
  assert.strictEqual(nextCalls.length, 0);
});

test('blocks reset requests for unverified users', async () => {
  const req = { body: { email: 'pending@example.com' } };
  const res = createMockResponse();
  const nextCalls = [];
  const next = (...args) => nextCalls.push(args);

  __setGetUserByEmail(async () => ({
    id: 'user-2',
    email: 'pending@example.com',
    firstName: 'Pending',
    isEmailVerified: false,
  }));

  __setGenerateVerificationToken(async () => ({ token: 'should-not-be-used' }));
  __setSendPasswordResetEmail(async () => undefined);

  __setLogAuditEvent(async () => undefined);

  await requestPasswordReset(req, res, next);

  assert.deepEqual(res.jsonPayload, {
    status: 'success',
    message: 'Please verify your email before requesting a password reset.',
  });
  assert.strictEqual(__getGenerateVerificationTokenCalls().length, 0);
  assert.strictEqual(__getSendPasswordResetEmailCalls().length, 0);

  const [logCall] = __getLogAuditEventCalls();
  assert.ok(logCall, 'Expected logAuditEvent to be called');
  assert.deepEqual(logCall[0], {
    actorId: 'user-2',
    eventType: AuditEventType.PASSWORD_RESET_REQUESTED,
    resource: 'user',
    resourceId: 'user-2',
    metadata: {
      email: 'pending@example.com',
      blocked: true,
      reason: 'EMAIL_NOT_VERIFIED',
    },
  });
  assert.strictEqual(nextCalls.length, 0);
});
