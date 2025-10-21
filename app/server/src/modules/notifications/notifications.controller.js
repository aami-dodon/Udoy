import { NotificationStatus } from '@prisma/client';
import AppError from '../../utils/appError.js';
import logger from '../../utils/logger.js';
import {
  createNotificationTemplate,
  updateNotificationTemplate,
  archiveNotificationTemplate,
  listNotificationTemplates,
  getNotificationTemplateById,
  normalizeChannel,
} from '../../services/notificationTemplateService.js';
import {
  dispatchNotifications as dispatchNotificationBatch,
  getNotificationById,
  listNotifications,
} from '../../services/notificationService.js';

function normalizeStatus(value) {
  if (!value) {
    return undefined;
  }

  const normalized = typeof value === 'string' ? value.trim().toUpperCase() : '';
  return Object.values(NotificationStatus).includes(normalized) ? normalized : undefined;
}

function normalizeChannelQuery(value) {
  if (!value) {
    return undefined;
  }

  try {
    return normalizeChannel(value);
  } catch (error) {
    return undefined;
  }
}

export async function handleCreateTemplate(req, res, next) {
  try {
    const actorId = req.user?.sub || null;
    const template = await createNotificationTemplate(req.body, { actorId });
    return res.status(201).json({
      status: 'success',
      data: template,
    });
  } catch (error) {
    return next(error);
  }
}

export async function handleUpdateTemplate(req, res, next) {
  try {
    const actorId = req.user?.sub || null;
    const { templateId } = req.params;
    const template = await updateNotificationTemplate(templateId, req.body, { actorId });
    return res.json({
      status: 'success',
      data: template,
    });
  } catch (error) {
    return next(error);
  }
}

export async function handleArchiveTemplate(req, res, next) {
  try {
    const actorId = req.user?.sub || null;
    const { templateId } = req.params;
    const template = await archiveNotificationTemplate(templateId, { actorId });
    return res.json({
      status: 'success',
      data: template,
    });
  } catch (error) {
    return next(error);
  }
}

export async function handleGetTemplate(req, res, next) {
  try {
    const { templateId } = req.params;
    const template = await getNotificationTemplateById(templateId);
    if (!template) {
      throw AppError.notFound('Notification template not found.', {
        code: 'NOTIFICATION_TEMPLATE_NOT_FOUND',
      });
    }

    return res.json({
      status: 'success',
      data: template,
    });
  } catch (error) {
    return next(error);
  }
}

export async function handleListTemplates(req, res, next) {
  try {
    const templates = await listNotificationTemplates({
      eventKey: req.query.eventKey,
      channel: req.query.channel,
      locale: req.query.locale,
      includeInactive: req.query.includeInactive === 'true',
    });

    return res.json({
      status: 'success',
      data: templates,
    });
  } catch (error) {
    return next(error);
  }
}

export async function handleDispatchNotifications(req, res, next) {
  try {
    const actorId = req.user?.sub || null;
    const results = await dispatchNotificationBatch(req.body, { actorId });

    logger.info('Notification dispatch request processed', {
      eventKey: req.body?.eventKey,
      recipientCount: Array.isArray(req.body?.recipients) ? req.body.recipients.length : 0,
      actorId,
    });

    return res.status(202).json({
      status: 'success',
      data: results,
    });
  } catch (error) {
    return next(error);
  }
}

export async function handleListNotifications(req, res, next) {
  try {
    const status = normalizeStatus(req.query.status);
    const channel = normalizeChannelQuery(req.query.channel);
    const notifications = await listNotifications({
      status,
      channel,
      eventKey: req.query.eventKey,
      userId: req.query.userId,
    });

    return res.json({
      status: 'success',
      data: notifications,
    });
  } catch (error) {
    return next(error);
  }
}

export async function handleGetNotification(req, res, next) {
  try {
    const { notificationId } = req.params;
    const notification = await getNotificationById(notificationId);
    if (!notification) {
      throw AppError.notFound('Notification not found.', {
        code: 'NOTIFICATION_NOT_FOUND',
      });
    }

    return res.json({
      status: 'success',
      data: notification,
    });
  } catch (error) {
    return next(error);
  }
}

export default {
  handleCreateTemplate,
  handleUpdateTemplate,
  handleArchiveTemplate,
  handleGetTemplate,
  handleListTemplates,
  handleDispatchNotifications,
  handleListNotifications,
  handleGetNotification,
};
