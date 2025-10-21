import { NotificationChannel } from '@prisma/client';
import prisma from '../utils/prismaClient.js';
import AppError from '../utils/appError.js';
import logger from '../utils/logger.js';
import { getLocaleCandidates, normalizeLocale } from '../utils/locale.js';

const CHANNEL_VALUES = new Set(Object.values(NotificationChannel));

function sanitizeString(value, { required = false, maxLength = 2000 } = {}) {
  if (value === undefined || value === null) {
    if (required) {
      throw AppError.badRequest('A required field is missing.', {
        code: 'NOTIFICATION_TEMPLATE_FIELD_REQUIRED',
      });
    }
    return null;
  }

  if (typeof value !== 'string') {
    if (required) {
      throw AppError.badRequest('A required field must be provided as a string.', {
        code: 'NOTIFICATION_TEMPLATE_INVALID_FIELD_TYPE',
      });
    }
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    if (required) {
      throw AppError.badRequest('A required field cannot be empty.', {
        code: 'NOTIFICATION_TEMPLATE_FIELD_EMPTY',
      });
    }
    return null;
  }

  return trimmed.slice(0, maxLength);
}

function sanitizeRoles(roles) {
  if (!Array.isArray(roles)) {
    return [];
  }

  const unique = new Set();
  for (const role of roles) {
    if (typeof role !== 'string') {
      continue; // eslint-disable-line no-continue
    }
    const trimmed = role.trim().toLowerCase();
    if (trimmed) {
      unique.add(trimmed);
    }
  }
  return Array.from(unique).slice(0, 20);
}

function sanitizeJson(payload) {
  if (payload === undefined || payload === null) {
    return null;
  }

  if (typeof payload === 'object' && !Array.isArray(payload)) {
    return payload;
  }

  throw AppError.badRequest('JSON fields must be provided as objects.', {
    code: 'NOTIFICATION_TEMPLATE_INVALID_JSON',
  });
}

export function normalizeChannel(channel) {
  if (!channel) {
    return NotificationChannel.EMAIL;
  }

  const value = typeof channel === 'string' ? channel.trim().toUpperCase() : '';
  if (!CHANNEL_VALUES.has(value)) {
    throw AppError.badRequest('Unsupported notification channel requested.', {
      code: 'NOTIFICATION_TEMPLATE_INVALID_CHANNEL',
    });
  }

  return value;
}

function buildTemplateData(payload = {}, { actorId } = {}) {
  const name = sanitizeString(payload.name, { required: true, maxLength: 160 });
  const eventKey = sanitizeString(payload.eventKey, { required: true, maxLength: 160 });
  const channel = normalizeChannel(payload.channel);
  const locale = normalizeLocale(payload.locale);
  const body = sanitizeString(payload.body, { required: true, maxLength: 12000 });
  const subject = sanitizeString(payload.subject, { maxLength: 240 });
  const previewText = sanitizeString(payload.previewText, { maxLength: 256 });
  const roles = sanitizeRoles(payload.audienceRoles);
  const dataSchema = sanitizeJson(payload.dataSchema);
  const defaultData = sanitizeJson(payload.defaultData);
  const active = payload.active === undefined ? true : Boolean(payload.active);

  return {
    name,
    eventKey,
    channel,
    locale,
    body,
    subject,
    previewText,
    audienceRoles: roles,
    dataSchema,
    defaultData,
    active,
    ...(actorId ? { createdById: actorId, updatedById: actorId } : {}),
  };
}

export async function createNotificationTemplate(payload, { actorId } = {}) {
  const data = buildTemplateData(payload, { actorId });

  try {
    const template = await prisma.notificationTemplate.create({ data });
    logger.info('Notification template created', {
      templateId: template.id,
      eventKey: template.eventKey,
      channel: template.channel,
    });
    return template;
  } catch (error) {
    throw AppError.from(error, {
      code: 'NOTIFICATION_TEMPLATE_CREATE_FAILED',
      status: 500,
    });
  }
}

export async function updateNotificationTemplate(templateId, payload, { actorId } = {}) {
  const id = sanitizeString(templateId, { required: true, maxLength: 100 });
  const template = await prisma.notificationTemplate.findUnique({ where: { id } });
  if (!template) {
    throw AppError.notFound('Notification template not found.', {
      code: 'NOTIFICATION_TEMPLATE_NOT_FOUND',
    });
  }

  const data = buildTemplateData({ ...template, ...payload }, { actorId: actorId || template.updatedById });
  delete data.createdById;
  data.updatedById = actorId || template.updatedById;

  try {
    const updated = await prisma.notificationTemplate.update({
      where: { id },
      data,
    });
    logger.info('Notification template updated', {
      templateId: updated.id,
      eventKey: updated.eventKey,
      channel: updated.channel,
    });
    return updated;
  } catch (error) {
    throw AppError.from(error, {
      code: 'NOTIFICATION_TEMPLATE_UPDATE_FAILED',
      status: 500,
    });
  }
}

export async function archiveNotificationTemplate(templateId, { actorId } = {}) {
  const id = sanitizeString(templateId, { required: true, maxLength: 100 });
  const template = await prisma.notificationTemplate.findUnique({ where: { id } });
  if (!template) {
    throw AppError.notFound('Notification template not found.', {
      code: 'NOTIFICATION_TEMPLATE_NOT_FOUND',
    });
  }

  if (!template.active) {
    return template;
  }

  try {
    const archived = await prisma.notificationTemplate.update({
      where: { id },
      data: {
        active: false,
        ...(actorId ? { updatedById: actorId } : {}),
      },
    });
    logger.info('Notification template archived', {
      templateId: archived.id,
      eventKey: archived.eventKey,
      channel: archived.channel,
    });
    return archived;
  } catch (error) {
    throw AppError.from(error, {
      code: 'NOTIFICATION_TEMPLATE_ARCHIVE_FAILED',
      status: 500,
    });
  }
}

export async function getNotificationTemplateById(templateId) {
  const id = sanitizeString(templateId, { required: true, maxLength: 100 });
  return prisma.notificationTemplate.findUnique({ where: { id } });
}

export async function listNotificationTemplates({ eventKey, channel, locale, includeInactive = false } = {}) {
  const normalizedChannel = channel ? normalizeChannel(channel) : undefined;
  const normalizedLocale = locale ? normalizeLocale(locale) : undefined;
  const where = {
    ...(eventKey ? { eventKey: sanitizeString(eventKey, { maxLength: 160 }) } : {}),
    ...(normalizedChannel ? { channel: normalizedChannel } : {}),
    ...(normalizedLocale ? { locale: normalizedLocale } : {}),
    ...(includeInactive ? {} : { active: true }),
  };

  return prisma.notificationTemplate.findMany({
    where,
    orderBy: [{ eventKey: 'asc' }, { channel: 'asc' }, { locale: 'asc' }],
  });
}

function selectRoleSpecificTemplate(templates, roles = [], localeCandidates = []) {
  if (!templates?.length) {
    return null;
  }

  const normalizedRoles = Array.isArray(roles)
    ? roles.map((role) => (typeof role === 'string' ? role.trim().toLowerCase() : '')).filter(Boolean)
    : [];

  for (const localeVariant of localeCandidates) {
    const localeMatches = templates.filter((template) => template.locale === localeVariant);
    if (!localeMatches.length) {
      continue; // eslint-disable-line no-continue
    }

    const roleSpecific = localeMatches.find(
      (template) => template.audienceRoles.length && template.audienceRoles.some((role) => normalizedRoles.includes(role))
    );
    if (roleSpecific) {
      return roleSpecific;
    }

    const generic = localeMatches.find((template) => !template.audienceRoles.length);
    if (generic) {
      return generic;
    }
  }

  return null;
}

export async function resolveNotificationTemplate({ eventKey, channel, locale, roles = [] } = {}) {
  const normalizedChannel = normalizeChannel(channel);
  const localeCandidates = getLocaleCandidates(locale);

  const templates = await prisma.notificationTemplate.findMany({
    where: {
      eventKey: sanitizeString(eventKey, { required: true, maxLength: 160 }),
      channel: normalizedChannel,
      active: true,
    },
    orderBy: [{ locale: 'asc' }],
  });

  const match = selectRoleSpecificTemplate(templates, roles, localeCandidates);
  if (!match) {
    logger.warn('No notification template resolved', {
      eventKey,
      channel: normalizedChannel,
      localeCandidates,
    });
  }
  return match;
}

export default {
  createNotificationTemplate,
  updateNotificationTemplate,
  archiveNotificationTemplate,
  getNotificationTemplateById,
  listNotificationTemplates,
  resolveNotificationTemplate,
  normalizeChannel,
};
