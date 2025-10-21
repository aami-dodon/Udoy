import {
  NotificationChannel,
  NotificationPriority,
  NotificationStatus,
} from '@prisma/client';
import prisma from '../utils/prismaClient.js';
import AppError from '../utils/appError.js';
import logger from '../utils/logger.js';
import { renderTemplate, stripHtml } from '../utils/templateRenderer.js';
import { wrapWithBranding } from '../utils/emailBranding.js';
import { normalizeLocale } from '../utils/locale.js';
import { normalizeChannel, resolveNotificationTemplate } from './notificationTemplateService.js';
import { sendEmail } from './emailService.js';

const CHANNEL_PREFERENCE_MAP = {
  [NotificationChannel.EMAIL]: 'email',
  [NotificationChannel.IN_APP]: 'push',
  [NotificationChannel.SMS]: 'sms',
};

const PRIORITY_VALUES = new Set(Object.values(NotificationPriority));

function sanitizeIdempotencyKey(key) {
  if (!key) {
    return null;
  }

  if (typeof key !== 'string') {
    throw AppError.badRequest('Idempotency key must be a string when provided.', {
      code: 'NOTIFICATION_INVALID_IDEMPOTENCY_KEY',
    });
  }

  const trimmed = key.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed.slice(0, 160);
}

function sanitizeMetadata(metadata) {
  if (metadata === undefined || metadata === null) {
    return null;
  }

  if (typeof metadata === 'object' && !Array.isArray(metadata)) {
    return metadata;
  }

  throw AppError.badRequest('Metadata must be provided as an object.', {
    code: 'NOTIFICATION_INVALID_METADATA',
  });
}

function coercePriority(priority) {
  if (!priority) {
    return NotificationPriority.NORMAL;
  }

  const value = typeof priority === 'string' ? priority.trim().toUpperCase() : '';
  if (!PRIORITY_VALUES.has(value)) {
    throw AppError.badRequest('Unsupported notification priority supplied.', {
      code: 'NOTIFICATION_INVALID_PRIORITY',
    });
  }

  return value;
}

function parseScheduleDate(scheduleAt) {
  if (!scheduleAt) {
    return null;
  }

  const date = new Date(scheduleAt);
  if (Number.isNaN(date.getTime())) {
    throw AppError.badRequest('scheduleAt must be a valid ISO 8601 timestamp.', {
      code: 'NOTIFICATION_INVALID_SCHEDULE',
    });
  }

  return date;
}

async function loadUserContext(userId) {
  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      roles: {
        select: {
          role: {
            select: { name: true },
          },
        },
      },
      profile: {
        select: {
          notificationSettings: true,
          learningLanguages: true,
          timezone: true,
        },
      },
    },
  });

  if (!user) {
    throw AppError.notFound('Target user for notification was not found.', {
      code: 'NOTIFICATION_USER_NOT_FOUND',
    });
  }

  return user;
}

function resolveRecipientEmail(user, explicitEmail) {
  if (explicitEmail) {
    if (typeof explicitEmail !== 'string') {
      throw AppError.badRequest('Recipient email address must be a string.', {
        code: 'NOTIFICATION_INVALID_RECIPIENT',
      });
    }

    const trimmed = explicitEmail.trim();
    if (!trimmed) {
      throw AppError.badRequest('Recipient email address cannot be empty.', {
        code: 'NOTIFICATION_INVALID_RECIPIENT',
      });
    }

    return trimmed.toLowerCase();
  }

  return user?.email || null;
}

function resolveUserRoles(user) {
  if (!user?.roles?.length) {
    return [];
  }

  return user.roles
    .map((entry) => entry?.role?.name)
    .filter((name) => typeof name === 'string' && name.trim())
    .map((name) => name.trim().toLowerCase());
}

function resolveLocale(preferredLocale, user) {
  if (preferredLocale) {
    return normalizeLocale(preferredLocale);
  }

  const fallback = user?.profile?.learningLanguages?.[0] || undefined;
  return normalizeLocale(fallback);
}

function shouldSendViaChannel(channel, preferences, { forceDelivery = false } = {}) {
  if (forceDelivery) {
    return true;
  }

  const key = CHANNEL_PREFERENCE_MAP[channel];
  if (!key) {
    return true;
  }

  const preferenceValue = preferences && typeof preferences === 'object' ? preferences[key] : undefined;
  if (preferenceValue === undefined || preferenceValue === null) {
    return true;
  }

  return Boolean(preferenceValue);
}

function mergeTemplateVariables(template, data, user) {
  const defaults = template?.defaultData && typeof template.defaultData === 'object' ? template.defaultData : {};
  const safeData = data && typeof data === 'object' ? data : {};
  const userFallback = user
    ? {
        user: {
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
        },
      }
    : {};

  return {
    ...userFallback,
    ...defaults,
    ...safeData,
  };
}

async function recordNotificationLog(notificationId, status, attempt, metadata, error) {
  await prisma.notificationLog.create({
    data: {
      notificationId,
      status,
      attempt,
      metadata: metadata ? { ...metadata } : undefined,
      errorMessage: error ? String(error) : undefined,
    },
  });
}

async function updateNotificationStatus(notificationId, data) {
  return prisma.notification.update({
    where: { id: notificationId },
    data,
  });
}

async function createNotificationRecord({
  user,
  channel,
  priority,
  eventKey,
  template,
  locale,
  subject,
  body,
  data,
  metadata,
  idempotencyKey,
  scheduleAt,
  recipient,
}) {
  const record = await prisma.notification.create({
    data: {
      userId: user?.id || null,
      recipient: recipient || null,
      channel,
      status: scheduleAt ? NotificationStatus.SCHEDULED : NotificationStatus.PENDING,
      priority,
      eventKey,
      templateId: template?.id || null,
      locale,
      subject,
      body,
      data,
      metadata: metadata ? { ...metadata } : null,
      idempotencyKey,
      scheduledAt: scheduleAt,
      attemptCount: 0,
    },
  });

  if (scheduleAt) {
    await recordNotificationLog(record.id, NotificationStatus.SCHEDULED, 0, metadata, null);
  }

  return record;
}

async function dispatchEmail({ notification, template, variables, metadata }) {
  const htmlBody = renderTemplate(template?.body, variables);
  const subject = template?.subject ? renderTemplate(template.subject, variables) : notification.subject || template?.name;
  const previewText = template?.previewText ? renderTemplate(template.previewText, variables) : undefined;
  const wrappedHtml = wrapWithBranding(htmlBody, {
    title: subject || template?.name || 'Udoy Notification',
    previewText,
  });
  const textBody = stripHtml(htmlBody);

  const result = await sendEmail({
    to: notification.recipient,
    subject,
    html: wrappedHtml,
    text: textBody,
  });

  const metadataPatch = {
    ...(metadata || {}),
    channelResponse: {
      ...(metadata?.channelResponse || {}),
      messageId: result?.messageId,
      accepted: result?.accepted,
      rejected: result?.rejected,
    },
  };

  await updateNotificationStatus(notification.id, {
    status: NotificationStatus.SENT,
    sentAt: new Date(),
    attemptCount: { increment: 1 },
    subject,
    body: wrappedHtml,
    metadata: metadataPatch,
  });

  await recordNotificationLog(notification.id, NotificationStatus.SENT, notification.attemptCount + 1, metadataPatch, null);

  logger.info('Email notification dispatched', {
    notificationId: notification.id,
    eventKey: notification.eventKey,
    recipient: notification.recipient,
  });
}

async function dispatchInApp({ notification, template, variables, metadata }) {
  const body = renderTemplate(template?.body, variables);
  const subject = template?.subject ? renderTemplate(template.subject, variables) : notification.subject;

  const metadataPatch = {
    ...(metadata || {}),
    inApp: {
      deliveredAt: new Date().toISOString(),
    },
  };

  await updateNotificationStatus(notification.id, {
    status: NotificationStatus.DELIVERED,
    deliveredAt: new Date(),
    attemptCount: { increment: 1 },
    subject,
    body,
    metadata: metadataPatch,
  });

  await recordNotificationLog(notification.id, NotificationStatus.DELIVERED, notification.attemptCount + 1, metadataPatch, null);

  logger.info('In-app notification recorded', {
    notificationId: notification.id,
    eventKey: notification.eventKey,
  });
}

async function dispatchSms({ notification }) {
  throw AppError.serviceUnavailable('SMS delivery is not yet available for notifications.', {
    code: 'NOTIFICATION_SMS_UNAVAILABLE',
    details: { notificationId: notification.id },
    expose: false,
  });
}

async function sendViaChannel(context) {
  const { notification } = context;

  try {
    switch (notification.channel) {
      case NotificationChannel.EMAIL:
        await dispatchEmail(context);
        break;
      case NotificationChannel.IN_APP:
        await dispatchInApp(context);
        break;
      case NotificationChannel.SMS:
        await dispatchSms(context);
        break;
      default:
        throw AppError.badRequest('Unsupported channel requested.', {
          code: 'NOTIFICATION_UNSUPPORTED_CHANNEL',
        });
    }

    return prisma.notification.findUnique({ where: { id: notification.id } });
  } catch (error) {
    await updateNotificationStatus(notification.id, {
      status: NotificationStatus.FAILED,
      errorMessage: error.message || 'Notification delivery failed.',
      attemptCount: { increment: 1 },
    });

    await recordNotificationLog(
      notification.id,
      NotificationStatus.FAILED,
      notification.attemptCount + 1,
      context.metadata,
      error.message
    );

    logger.error('Notification delivery failed', {
      notificationId: notification.id,
      eventKey: notification.eventKey,
      channel: notification.channel,
      error: error.message,
    });

    throw error;
  }
}

async function resolveTemplateOrThrow({ eventKey, channel, locale, roles }) {
  const template = await resolveNotificationTemplate({ eventKey, channel, locale, roles });
  if (!template) {
    throw AppError.notFound('No template available for the notification request.', {
      code: 'NOTIFICATION_TEMPLATE_MISSING',
    });
  }
  return template;
}

async function ensureIdempotency(idempotencyKey) {
  if (!idempotencyKey) {
    return null;
  }

  const existing = await prisma.notification.findUnique({ where: { idempotencyKey } });
  return existing;
}

export async function listNotifications({ status, channel, eventKey, userId } = {}) {
  const where = {
    ...(status ? { status } : {}),
    ...(channel ? { channel } : {}),
    ...(eventKey ? { eventKey } : {}),
    ...(userId ? { userId } : {}),
  };

  return prisma.notification.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }],
    take: 200,
  });
}

export async function getNotificationById(id) {
  if (!id) {
    throw AppError.badRequest('Notification id is required.', {
      code: 'NOTIFICATION_ID_REQUIRED',
    });
  }

  return prisma.notification.findUnique({
    where: { id },
    include: {
      logs: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });
}

export async function dispatchNotifications(request = {}, { actorId } = {}) {
  const eventKey = request.eventKey && typeof request.eventKey === 'string' ? request.eventKey.trim() : '';
  if (!eventKey) {
    throw AppError.badRequest('eventKey is required to dispatch notifications.', {
      code: 'NOTIFICATION_EVENT_KEY_REQUIRED',
    });
  }

  const priority = coercePriority(request.priority);
  const forceDelivery = Boolean(request.forceDelivery);
  const scheduleAt = parseScheduleDate(request.scheduleAt);
  const metadataSource = sanitizeMetadata(request.metadata);
  const sharedMetadata = metadataSource ? { ...metadataSource } : {};
  if (actorId) {
    sharedMetadata.actorId = actorId;
  }

  const recipients = Array.isArray(request.recipients) ? request.recipients : [];
  if (!recipients.length) {
    throw AppError.badRequest('At least one recipient must be provided.', {
      code: 'NOTIFICATION_RECIPIENT_REQUIRED',
    });
  }

  const results = [];
  for (const target of recipients) {
    try {
      const targetMetadataSource = sanitizeMetadata(target?.metadata);
      const mergedMetadata = {
        ...sharedMetadata,
        ...(targetMetadataSource || {}),
      };

      const response = await dispatchSingleNotification({
        eventKey,
        target,
        priority,
        metadata: Object.keys(mergedMetadata).length ? mergedMetadata : null,
        forceDelivery,
        scheduleAt,
      });
      results.push({ status: 'fulfilled', notification: response });
    } catch (error) {
      results.push({
        status: 'rejected',
        error: {
          message: error.message,
          code: error.code || 'NOTIFICATION_DISPATCH_FAILED',
        },
      });
    }
  }

  return results;
}

async function dispatchSingleNotification({ eventKey, target, priority, metadata, forceDelivery, scheduleAt }) {
  const normalizedChannels = Array.isArray(target?.channels) && target.channels.length
    ? target.channels.map(normalizeChannel)
    : [NotificationChannel.EMAIL, NotificationChannel.IN_APP];

  const idempotencyKey = sanitizeIdempotencyKey(target?.idempotencyKey);
  if (idempotencyKey) {
    const existing = await ensureIdempotency(idempotencyKey);
    if (existing) {
      return existing;
    }
  }

  const user = await loadUserContext(target?.userId);
  const roles = resolveUserRoles(user);
  const resolvedLocale = resolveLocale(target?.locale, user);
  const preferences = user?.profile?.notificationSettings || {};
  const recipientEmail = resolveRecipientEmail(user, target?.recipient);

  const channelResults = [];
  for (const channel of normalizedChannels) {
    if (!shouldSendViaChannel(channel, preferences, { forceDelivery })) {
      logger.info('Notification skipped due to user preferences', {
        userId: user?.id,
        channel,
        eventKey,
      });
      continue; // eslint-disable-line no-continue
    }

    if (channel === NotificationChannel.IN_APP && !user?.id) {
      logger.warn('In-app notification skipped because no user context is available', {
        eventKey,
      });
      continue; // eslint-disable-line no-continue
    }

    if (channel === NotificationChannel.EMAIL && !recipientEmail) {
      logger.warn('Email notification skipped because no recipient email is available', {
        userId: user?.id,
        eventKey,
      });
      continue; // eslint-disable-line no-continue
    }

    const template = await resolveTemplateOrThrow({
      eventKey,
      channel,
      locale: resolvedLocale,
      roles,
    });

    const variables = mergeTemplateVariables(template, target?.data, user);
    const renderedSubject = template.subject ? renderTemplate(template.subject, variables) : template.name;

    const notification = await createNotificationRecord({
      user,
      channel,
      priority,
      eventKey,
      template,
      locale: resolvedLocale,
      subject: renderedSubject,
      body: template.body,
      data: target?.data || null,
      metadata: metadata || null,
      idempotencyKey,
      scheduleAt,
      recipient: channel === NotificationChannel.EMAIL ? recipientEmail : null,
    });

    if (scheduleAt && scheduleAt.getTime() > Date.now()) {
      channelResults.push(notification);
      continue; // eslint-disable-line no-continue
    }

    const result = await sendViaChannel({
      notification,
      template,
      variables,
      metadata,
    });

    channelResults.push(result);
  }

  if (!channelResults.length) {
    throw AppError.badRequest('No channels were eligible for delivery.', {
      code: 'NOTIFICATION_NO_CHANNELS',
    });
  }

  return channelResults[channelResults.length - 1];
}

export default {
  listNotifications,
  getNotificationById,
  dispatchNotifications,
};
