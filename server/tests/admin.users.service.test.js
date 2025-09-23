import test from 'node:test';
import assert from 'node:assert/strict';
import { mock } from 'node:test';

import { updateUserByAdmin, deleteUserByAdmin } from '../src/modules/admin/users/users.service.js';

test('updateUserByAdmin records an audit log entry when changes occur', async () => {
  const baseUser = {
    id: 'user-1',
    name: 'Jane Doe',
    email: 'jane@example.com',
    role: 'student',
    isVerified: false,
    isActive: true,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    deletedAt: null,
    passwordUpdatedAt: null
  };

  const dependencies = {
    userRepository: {
      findUserById: mock.fn(async () => baseUser),
      updateUserById: mock.fn(async () => ({
        ...baseUser,
        name: 'Updated Name'
      })),
      setUserActiveState: mock.fn(async () => ({
        ...baseUser,
        isActive: false
      })),
      softDeleteUser: mock.fn(async () => {})
    },
    tokenRepository: {
      deleteTokensForUserByType: mock.fn(async () => {})
    },
    auditLogRepository: {
      createAuditLog: mock.fn(async () => ({ id: 'audit-1' }))
    },
    emailService: {
      sendAccountSettingsUpdatedEmail: mock.fn(async () => {}),
      sendAccountDeactivatedEmail: mock.fn(async () => {}),
      sendAccountDeletedEmail: mock.fn(async () => {})
    }
  };

  const result = await updateUserByAdmin(
    baseUser.id,
    {
      name: 'Updated Name'
    },
    { actorId: 'admin-1', dependencies }
  );

  assert.equal(result.name, 'Updated Name');
  assert.equal(dependencies.userRepository.findUserById.mock.calls.length, 1);
  assert.equal(dependencies.userRepository.updateUserById.mock.calls.length, 1);
  assert.equal(dependencies.userRepository.setUserActiveState.mock.calls.length, 0);
  assert.equal(dependencies.auditLogRepository.createAuditLog.mock.calls.length, 1);
  assert.equal(dependencies.emailService.sendAccountSettingsUpdatedEmail.mock.calls.length, 1);

  const auditPayload = dependencies.auditLogRepository.createAuditLog.mock.calls[0].arguments[0];
  assert.equal(auditPayload.action, 'admin.user.update');
  assert.equal(auditPayload.actorId, 'admin-1');
  assert.equal(auditPayload.targetUserId, baseUser.id);
  assert.ok(auditPayload.metadata.changes.name);
  assert.equal(auditPayload.metadata.changes.name.from, 'Jane Doe');
  assert.equal(auditPayload.metadata.changes.name.to, 'Updated Name');
});

test('deleteUserByAdmin records audit log for deletions', async () => {
  const baseUser = {
    id: 'user-2',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'teacher',
    isVerified: true,
    isActive: true,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    deletedAt: null,
    passwordUpdatedAt: null
  };

  let findCall = 0;
  const dependencies = {
    userRepository: {
      findUserById: mock.fn(async () => {
        findCall += 1;
        if (findCall === 1) {
          return baseUser;
        }
        return {
          ...baseUser,
          deletedAt: new Date('2024-02-01T00:00:00.000Z'),
          isActive: false
        };
      }),
      updateUserById: mock.fn(async () => baseUser),
      setUserActiveState: mock.fn(async () => baseUser),
      softDeleteUser: mock.fn(async () => {})
    },
    tokenRepository: {
      deleteTokensForUserByType: mock.fn(async () => {})
    },
    auditLogRepository: {
      createAuditLog: mock.fn(async () => ({ id: 'audit-2' }))
    },
    emailService: {
      sendAccountSettingsUpdatedEmail: mock.fn(async () => {}),
      sendAccountDeactivatedEmail: mock.fn(async () => {}),
      sendAccountDeletedEmail: mock.fn(async () => {})
    }
  };

  const result = await deleteUserByAdmin(baseUser.id, {
    actorId: 'admin-2',
    dependencies
  });

  assert.equal(result.id, baseUser.id);
  assert.equal(result.deletedAt instanceof Date, true);
  assert.equal(dependencies.userRepository.findUserById.mock.calls.length, 2);
  assert.equal(dependencies.userRepository.softDeleteUser.mock.calls.length, 1);
  assert.equal(dependencies.tokenRepository.deleteTokensForUserByType.mock.calls.length, 2);
  assert.equal(dependencies.emailService.sendAccountDeletedEmail.mock.calls.length, 1);
  assert.equal(dependencies.auditLogRepository.createAuditLog.mock.calls.length, 1);

  const auditPayload = dependencies.auditLogRepository.createAuditLog.mock.calls[0].arguments[0];
  assert.equal(auditPayload.action, 'admin.user.delete');
  assert.equal(auditPayload.actorId, 'admin-2');
  assert.equal(auditPayload.targetUserId, baseUser.id);
  assert.equal(auditPayload.metadata.previous.id, baseUser.id);
});
