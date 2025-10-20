import { AuditEventType } from '@prisma/client';
import prisma from '../utils/prismaClient.js';
import logger from '../utils/logger.js';
import { logAuditEvent } from './auditService.js';
import getEnforcer from '../integrations/casbin/enforcer.js';

export const ROLE_DEFINITIONS = [
  {
    name: 'platform-admin',
    label: 'Platform Admin',
    description:
      'Platform administrator with unrestricted access to tenant provisioning, security oversight, and RBAC management.',
    permissions: [
      {
        name: 'tenant.provision',
        resource: 'tenant',
        action: 'provision',
        description: 'Provision and configure new tenants.',
      },
      {
        name: 'user.manage',
        resource: 'user',
        action: 'manage',
        description: 'Create, update, deactivate, and reactivate users.',
      },
      {
        name: 'role.manage',
        resource: 'role',
        action: 'manage',
        description: 'Create and manage role capability bundles.',
      },
      {
        name: 'permission.manage',
        resource: 'permission',
        action: 'manage',
        description: 'Administer permissions and capability bundles.',
      },
      {
        name: 'audit-log.view',
        resource: 'audit-log',
        action: 'view',
        description: 'Review audit trails and session activity.',
      },
      {
        name: 'security.escalate',
        resource: 'security-incident',
        action: 'escalate',
        description: 'Escalate security incidents for containment.',
      },
      {
        name: 'session.invalidate',
        resource: 'session',
        action: 'invalidate',
        description: 'Force logout or revoke active sessions.',
      },
      {
        name: 'admin.dashboard',
        resource: 'admin:dashboard',
        action: 'read',
        description: 'Access administrative overview dashboards.',
      },
    ],
  },
  {
    name: 'student',
    label: 'Student',
    description: 'Learner with access to coursework, submissions, and personal progress dashboards.',
    permissions: [
      {
        name: 'profile.self',
        resource: 'user-profile',
        action: 'self-manage',
        description: 'Manage personal profile and account preferences.',
      },
      {
        name: 'content.consume',
        resource: 'learning-content',
        action: 'consume',
        description: 'Access assigned lessons and media.',
      },
      {
        name: 'assignment.submit',
        resource: 'assignment',
        action: 'submit',
        description: 'Submit assignments and activities.',
      },
      {
        name: 'progress.view',
        resource: 'progress',
        action: 'view',
        description: 'View learning analytics and growth metrics.',
      },
    ],
  },
  {
    name: 'creator',
    label: 'Creator',
    description: 'Content creator responsible for drafting and publishing curriculum.',
    permissions: [
      {
        name: 'content.draft',
        resource: 'learning-content',
        action: 'draft',
        description: 'Draft new content and manage revisions.',
      },
      {
        name: 'content.publish',
        resource: 'learning-content',
        action: 'publish',
        description: 'Publish and schedule approved content.',
      },
      {
        name: 'validator.collaborate',
        resource: 'content-validator',
        action: 'collaborate',
        description: 'Collaborate with validators for review cycles.',
      },
    ],
  },
  {
    name: 'validator',
    label: 'Validator/Reviewer',
    description: 'Reviewer tasked with quality and compliance checks prior to publication.',
    permissions: [
      {
        name: 'content.review',
        resource: 'learning-content',
        action: 'review',
        description: 'Review and approve content drafts.',
      },
      {
        name: 'compliance.checklist',
        resource: 'compliance',
        action: 'maintain',
        description: 'Maintain compliance checklists and audit evidence.',
      },
      {
        name: 'quality.control',
        resource: 'quality',
        action: 'control',
        description: 'Enforce quality standards across published assets.',
      },
    ],
  },
  {
    name: 'coach-guardian',
    label: 'Coach/Guardian',
    description: 'Guardian or coach supporting minors with onboarding and progress tracking.',
    permissions: [
      {
        name: 'student.onboard',
        resource: 'student',
        action: 'onboard',
        description: 'Assist students during onboarding and verification.',
      },
      {
        name: 'student.monitor',
        resource: 'student-progress',
        action: 'monitor',
        description: 'Monitor student progress dashboards and alerts.',
      },
      {
        name: 'credential.reset',
        resource: 'credential',
        action: 'reset',
        description: 'Initiate credential recovery for dependent students.',
      },
    ],
  },
  {
    name: 'sponsor-partner',
    label: 'Sponsor/Partner',
    description: 'Sponsors and partners who manage cohorts, analytics, and billing relationships.',
    permissions: [
      {
        name: 'cohort.manage',
        resource: 'cohort',
        action: 'manage',
        description: 'Manage sponsored student cohorts.',
      },
      {
        name: 'analytics.view',
        resource: 'analytics',
        action: 'view',
        description: 'Access aggregated analytics dashboards.',
      },
      {
        name: 'billing.manage',
        resource: 'billing',
        action: 'manage',
        description: 'Update billing contacts and sponsorship terms.',
      },
    ],
  },
];

function getPermissionKey(permission) {
  return `${permission.resource}:${permission.action}`;
}

async function syncRolePolicies(roleName, permissions) {
  const enforcer = await getEnforcer();
  const subject = `role:${roleName}`;
  const desired = new Map(
    permissions.map((permission) => [getPermissionKey(permission), permission])
  );

  const existingPolicies = await enforcer.getFilteredPolicy(0, subject);
  for (const [_, resource, action] of existingPolicies) {
    const key = `${resource}:${action}`;
    if (!desired.has(key)) {
      await enforcer.removePolicy(subject, resource, action);
    }
  }

  for (const permission of permissions) {
    const { resource, action } = permission;
    const hasPolicy = await enforcer.hasPolicy(subject, resource, action);
    if (!hasPolicy) {
      await enforcer.addPolicy(subject, resource, action);
    }
  }
}

export async function ensureCoreRbac({ actorId } = {}) {
  for (const roleDefinition of ROLE_DEFINITIONS) {
    const { name, description, permissions } = roleDefinition;

    let role = await prisma.role.findUnique({ where: { name } });
    if (!role) {
      role = await prisma.role.create({
        data: { name, description },
      });
      await logAuditEvent({
        actorId,
        eventType: AuditEventType.ROLE_CREATED,
        resource: 'role',
        resourceId: role.id,
        metadata: { name },
      });
    } else if (role.description !== description) {
      role = await prisma.role.update({
        where: { id: role.id },
        data: { description },
      });
      await logAuditEvent({
        actorId,
        eventType: AuditEventType.ROLE_UPDATED,
        resource: 'role',
        resourceId: role.id,
        metadata: { name },
      });
    }

    for (const permissionDefinition of permissions) {
      const { name: permissionName, resource, action, description: permDescription } = permissionDefinition;

      let permission = await prisma.permission.findUnique({ where: { name: permissionName } });
      if (!permission) {
        permission = await prisma.permission.create({
          data: {
            name: permissionName,
            resource,
            action,
            description: permDescription,
          },
        });
        await logAuditEvent({
          actorId,
          eventType: AuditEventType.PERMISSION_CREATED,
          resource: 'permission',
          resourceId: permission.id,
          metadata: { name: permissionName },
        });
      } else if (
        permission.resource !== resource ||
        permission.action !== action ||
        permission.description !== permDescription
      ) {
        permission = await prisma.permission.update({
          where: { id: permission.id },
          data: {
            resource,
            action,
            description: permDescription,
          },
        });
        await logAuditEvent({
          actorId,
          eventType: AuditEventType.PERMISSION_UPDATED,
          resource: 'permission',
          resourceId: permission.id,
          metadata: { name: permissionName },
        });
      }

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id,
          assignedById: actorId ?? null,
        },
      });
    }

    try {
      await syncRolePolicies(name, permissions);
    } catch (error) {
      logger.error('Failed to synchronize Casbin policy for role', {
        role: name,
        error: error.message,
      });
    }
  }
}

export function getRoleDefinition(roleName) {
  return ROLE_DEFINITIONS.find((role) => role.name === roleName) || null;
}

export function listRoleDefinitions() {
  return ROLE_DEFINITIONS.map((role) => ({
    name: role.name,
    label: role.label,
    description: role.description,
    permissions: role.permissions,
  }));
}

export default {
  ROLE_DEFINITIONS,
  ensureCoreRbac,
  getRoleDefinition,
  listRoleDefinitions,
};
