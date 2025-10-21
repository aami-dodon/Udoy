import { AuditEventType } from '@prisma/client';
import prisma from '../utils/prismaClient.js';
import logger from '../utils/logger.js';
import { logAuditEvent } from './auditService.js';
import getEnforcer from '../integrations/casbin/enforcer.js';

const ROLE_NAME_MAPPINGS = {
  'platform-admin': 'admin',
  validator: 'teacher',
  'coach-guardian': 'coach',
  'sponsor-partner': 'sponsor',
};

export const ROLE_DEFINITIONS = [
  {
    name: 'admin',
    label: 'Admin',
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
      {
        name: 'profile.manage',
        resource: 'user-profile',
        action: 'manage',
        description: 'Moderate and edit user profile settings platform-wide.',
      },
      {
        name: 'notification.manage',
        resource: 'notification',
        action: 'manage',
        description: 'Administer notification templates and audit delivery logs.',
      },
      {
        name: 'notification.dispatch',
        resource: 'notification',
        action: 'dispatch',
        description: 'Dispatch platform notifications across supported channels.',
      },
      {
        name: 'topic.view',
        resource: 'topic',
        action: 'view',
        description: 'View and audit topics across the library.',
      },
      {
        name: 'topic.create',
        resource: 'topic',
        action: 'create',
        description: 'Create new topic drafts for the library.',
      },
      {
        name: 'topic.edit',
        resource: 'topic',
        action: 'edit',
        description: 'Edit topic drafts in any workflow state.',
      },
      {
        name: 'topic.submit',
        resource: 'topic',
        action: 'submit',
        description: 'Submit topics for validation workflows.',
      },
      {
        name: 'topic.review',
        resource: 'topic',
        action: 'review',
        description: 'Review and approve content drafts as part of moderation.',
      },
      {
        name: 'topic.publish',
        resource: 'topic',
        action: 'publish',
        description: 'Publish validated topics to the learning catalog.',
      },
      {
        name: 'topic.comment',
        resource: 'topic-comment',
        action: 'manage',
        description: 'Collaborate on review threads and workflow comments.',
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
        name: 'profile.self',
        resource: 'user-profile',
        action: 'self-manage',
        description: 'Manage personal profile and account preferences.',
      },
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
        name: 'teacher.collaborate',
        resource: 'teacher-collaboration',
        action: 'collaborate',
        description: 'Collaborate with teachers for review cycles and classroom readiness.',
      },
      {
        name: 'topic.view',
        resource: 'topic',
        action: 'view',
        description: 'Access draft and published topics for authoring.',
      },
      {
        name: 'topic.create',
        resource: 'topic',
        action: 'create',
        description: 'Create new topic drafts.',
      },
      {
        name: 'topic.edit',
        resource: 'topic',
        action: 'edit',
        description: 'Edit owned topic drafts prior to submission.',
      },
      {
        name: 'topic.submit',
        resource: 'topic',
        action: 'submit',
        description: 'Submit drafts for validation workflows.',
      },
      {
        name: 'topic.comment',
        resource: 'topic-comment',
        action: 'manage',
        description: 'Participate in topic review discussions.',
      },
    ],
  },
  {
    name: 'teacher',
    label: 'Teacher',
    description: 'Educator tasked with pedagogy, quality, and compliance checks prior to publication.',
    permissions: [
      {
        name: 'profile.self',
        resource: 'user-profile',
        action: 'self-manage',
        description: 'Manage personal profile and account preferences.',
      },
      {
        name: 'content.review',
        resource: 'learning-content',
        action: 'review',
        description: 'Review and approve content drafts.',
      },
      {
        name: 'curriculum.align',
        resource: 'curriculum',
        action: 'align',
        description: 'Align lessons to curriculum standards and learning outcomes.',
      },
      {
        name: 'quality.assure',
        resource: 'quality',
        action: 'assure',
        description: 'Enforce quality standards across published assets.',
      },
      {
        name: 'topic.view',
        resource: 'topic',
        action: 'view',
        description: 'Access topics throughout validation and publication workflows.',
      },
      {
        name: 'topic.edit',
        resource: 'topic',
        action: 'edit',
        description: 'Edit topics during review cycles.',
      },
      {
        name: 'topic.review',
        resource: 'topic',
        action: 'review',
        description: 'Approve or request changes on submitted topics.',
      },
      {
        name: 'topic.comment',
        resource: 'topic-comment',
        action: 'manage',
        description: 'Leave structured review comments on topics.',
      },
    ],
  },
  {
    name: 'coach',
    label: 'Coach',
    description: 'Coach supporting students with onboarding, accountability, and progress tracking.',
    permissions: [
      {
        name: 'profile.self',
        resource: 'user-profile',
        action: 'self-manage',
        description: 'Manage personal profile and account preferences.',
      },
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
        name: 'credential.support',
        resource: 'credential',
        action: 'support',
        description: 'Support students with credential recovery and approvals.',
      },
    ],
  },
  {
    name: 'sponsor',
    label: 'Sponsor',
    description: 'Sponsor who manages cohorts, analytics, and billing relationships.',
    permissions: [
      {
        name: 'profile.self',
        resource: 'user-profile',
        action: 'self-manage',
        description: 'Manage personal profile and account preferences.',
      },
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
  for (const [legacyName, targetName] of Object.entries(ROLE_NAME_MAPPINGS)) {
    const legacyRole = await prisma.role.findUnique({ where: { name: legacyName } });
    if (legacyRole) {
      const collision = await prisma.role.findUnique({ where: { name: targetName } });
      if (!collision) {
        await prisma.role.update({
          where: { id: legacyRole.id },
          data: { name: targetName },
        });
      }
    }
  }

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

    const desiredPermissionNames = new Set(permissions.map((permission) => permission.name));
    const existingRolePermissions = await prisma.rolePermission.findMany({
      where: { roleId: role.id },
      include: { permission: true },
    });

    for (const rolePermission of existingRolePermissions) {
      if (!desiredPermissionNames.has(rolePermission.permission.name)) {
        await prisma.rolePermission.delete({
          where: {
            roleId_permissionId: {
              roleId: rolePermission.roleId,
              permissionId: rolePermission.permissionId,
            },
          },
        });
      }
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
