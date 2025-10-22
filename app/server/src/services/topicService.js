import {
  Prisma,
  TopicStatus,
  TopicContentFormat,
  TopicTagKind,
  TopicCommentType,
} from '@prisma/client';
import prisma from '../utils/prismaClient.js';
import AppError from '../utils/appError.js';
import logger from '../utils/logger.js';

const SUMMARY_MAX_LENGTH = 560;
const TITLE_MAX_LENGTH = 240;
const LANGUAGE_PATTERN = /^[a-z]{2}(?:-[A-Z]{2})?$/u;
const DEFAULT_LANGUAGE = 'en';

const TOPIC_MANAGEMENT_ROLES = new Set(['admin', 'creator', 'teacher']);

const TOPIC_SUMMARY_INCLUDE = {
  author: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
    },
  },
  validator: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
    },
  },
  tags: {
    include: {
      tag: true,
    },
  },
};

const TOPIC_FULL_INCLUDE = {
  ...TOPIC_SUMMARY_INCLUDE,
  revisions: {
    orderBy: { version: 'desc' },
    include: {
      createdBy: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  },
  workflowEvents: {
    orderBy: { createdAt: 'desc' },
    include: {
      actor: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  },
  comments: {
    orderBy: { createdAt: 'asc' },
    include: {
      author: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      resolvedBy: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  },
};

function toUserSummary(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  };
}

function toTagAssignmentResource(assignment) {
  if (!assignment) {
    return null;
  }

  const { tag } = assignment;
  return {
    id: tag?.id || null,
    slug: tag?.slug || null,
    label: tag?.label || null,
    description: tag?.description || null,
    kind: tag?.kind || TopicTagKind.CUSTOM,
    definitionMetadata: tag?.metadata || null,
    assignmentMetadata: assignment.metadata || null,
    assignedAt: assignment.assignedAt,
    assignedById: assignment.assignedById || null,
  };
}

function toRevisionResource(revision) {
  if (!revision) {
    return null;
  }

  return {
    id: revision.id,
    version: revision.version,
    status: revision.status,
    title: revision.title,
    summary: revision.summary,
    content: revision.content,
    contentFormat: revision.contentFormat,
    accessibility: revision.accessibility,
    metadata: revision.metadata,
    changeNotes: revision.changeNotes,
    createdAt: revision.createdAt,
    createdBy: toUserSummary(revision.createdBy),
  };
}

function toWorkflowEventResource(event) {
  if (!event) {
    return null;
  }

  return {
    id: event.id,
    topicId: event.topicId,
    actor: toUserSummary(event.actor),
    fromStatus: event.fromStatus,
    toStatus: event.toStatus,
    note: event.note,
    createdAt: event.createdAt,
  };
}

function toCommentResource(comment) {
  if (!comment) {
    return null;
  }

  return {
    id: comment.id,
    topicId: comment.topicId,
    author: toUserSummary(comment.author),
    type: comment.type,
    body: comment.body,
    createdAt: comment.createdAt,
    resolvedAt: comment.resolvedAt,
    resolvedBy: toUserSummary(comment.resolvedBy),
  };
}

export function toTopicResource(topic, options = {}) {
  if (!topic) {
    return null;
  }

  const {
    includeContent = true,
    includeRevisions = false,
    includeWorkflow = false,
    includeComments = false,
  } = options;

  const base = {
    id: topic.id,
    title: topic.title,
    summary: topic.summary,
    language: topic.language,
    status: topic.status,
    version: topic.version,
    author: toUserSummary(topic.author),
    validator: toUserSummary(topic.validator),
    tags: Array.isArray(topic.tags) ? topic.tags.map((assignment) => toTagAssignmentResource(assignment)).filter(Boolean) : [],
    baseTopicId: topic.baseTopicId,
    submittedAt: topic.submittedAt,
    approvedAt: topic.approvedAt,
    publishedAt: topic.publishedAt,
    archivedAt: topic.archivedAt,
    createdAt: topic.createdAt,
    updatedAt: topic.updatedAt,
  };

  if (includeContent) {
    base.content = topic.content ?? null;
    base.contentFormat = topic.contentFormat ?? TopicContentFormat.JSON;
    base.accessibility = topic.accessibility ?? null;
    base.metadata = topic.metadata ?? null;
  }

  if (includeRevisions) {
    base.revisions = Array.isArray(topic.revisions)
      ? topic.revisions.map((revision) => toRevisionResource(revision)).filter(Boolean)
      : [];
  }

  if (includeWorkflow) {
    base.workflow = Array.isArray(topic.workflowEvents)
      ? topic.workflowEvents.map((event) => toWorkflowEventResource(event)).filter(Boolean)
      : [];
  }

  if (includeComments) {
    base.comments = Array.isArray(topic.comments)
      ? topic.comments.map((comment) => toCommentResource(comment)).filter(Boolean)
      : [];
  }

  return base;
}

function assertActor(actorId) {
  if (!actorId) {
    throw AppError.unauthorized('Authentication is required to manage topics.', {
      code: 'TOPIC_AUTH_REQUIRED',
    });
  }
}

function sanitizeString(value, { field, maxLength, required = false } = {}) {
  if (value == null) {
    if (required) {
      throw AppError.badRequest(`${field} is required.`);
    }
    return null;
  }

  if (typeof value !== 'string') {
    throw AppError.badRequest(`${field} must be a string.`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    if (required) {
      throw AppError.badRequest(`${field} cannot be empty.`);
    }
    return null;
  }

  if (maxLength && trimmed.length > maxLength) {
    return trimmed.slice(0, maxLength);
  }

  return trimmed;
}

function sanitizeLanguage(language) {
  const normalized = sanitizeString(language ?? DEFAULT_LANGUAGE, {
    field: 'Language',
    maxLength: 16,
    required: true,
  });

  if (!LANGUAGE_PATTERN.test(normalized)) {
    throw AppError.badRequest('Language must be provided using ISO language codes (e.g., en or en-US).', {
      code: 'TOPIC_LANGUAGE_INVALID',
    });
  }

  return normalized;
}

function sanitizeContent(content, format) {
  if (format === TopicContentFormat.HTML) {
    if (content == null) {
      return null;
    }

    if (typeof content !== 'string') {
      throw AppError.badRequest('HTML content must be provided as a string.', {
        code: 'TOPIC_CONTENT_INVALID',
      });
    }

    return content.trim();
  }

  if (content == null) {
    return Prisma.JsonNull;
  }

  if (typeof content !== 'object') {
    throw AppError.badRequest('Rich text content must be provided as a JSON object.', {
      code: 'TOPIC_CONTENT_INVALID',
    });
  }

  return content;
}

function sanitizeJsonObject(value) {
  if (value == null) {
    return null;
  }

  if (typeof value !== 'object') {
    throw AppError.badRequest('Invalid metadata payload provided.', {
      code: 'TOPIC_METADATA_INVALID',
    });
  }

  return value;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function normalizeTagInput(tag) {
  if (!tag) {
    return null;
  }

  if (typeof tag === 'string') {
    const label = tag.trim();
    if (!label) {
      return null;
    }

    return {
      slug: slugify(label),
      label,
      kind: TopicTagKind.CUSTOM,
    };
  }

  if (typeof tag !== 'object') {
    return null;
  }

  const label = sanitizeString(tag.label, { field: 'Tag label', maxLength: 160, required: true });
  const slug = sanitizeString(tag.slug ?? slugify(label), { field: 'Tag slug', maxLength: 160, required: true });
  const description = sanitizeString(tag.description, { field: 'Tag description', maxLength: 360 }) ?? null;
  const hasMetadata = Object.prototype.hasOwnProperty.call(tag, 'metadata');
  const metadata = hasMetadata
    ? tag.metadata && typeof tag.metadata === 'object'
      ? tag.metadata
      : null
    : undefined;
  const hasAssignmentMetadata = Object.prototype.hasOwnProperty.call(tag, 'assignmentMetadata');
  const assignmentMetadata = hasAssignmentMetadata
    ? tag.assignmentMetadata && typeof tag.assignmentMetadata === 'object'
      ? tag.assignmentMetadata
      : null
    : undefined;
  const kind = typeof tag.kind === 'string' && Object.values(TopicTagKind).includes(tag.kind)
    ? tag.kind
    : TopicTagKind.CUSTOM;

  return {
    id: tag.id || null,
    slug: slugify(slug),
    label,
    description,
    kind,
    metadata,
    hasMetadata,
    assignmentMetadata,
    hasAssignmentMetadata,
  };
}

async function resolveTopicTags(tags, { actorId, prismaClient }) {
  const client = prismaClient || prisma;
  if (!Array.isArray(tags) || tags.length === 0) {
    return [];
  }

  const normalized = tags
    .map((tag) => normalizeTagInput(tag))
    .filter((tag) => tag && tag.slug && tag.label);

  const unique = new Map();
  for (const tag of normalized) {
    if (!unique.has(tag.slug)) {
      unique.set(tag.slug, tag);
    }
  }

  const resolved = [];
  for (const tag of unique.values()) {
    if (tag.id) {
      const existing = await client.topicTagDefinition.findUnique({ where: { id: tag.id } });
      if (!existing) {
        throw AppError.notFound('Topic tag definition not found.', {
          code: 'TOPIC_TAG_NOT_FOUND',
          details: { id: tag.id },
        });
      }

      resolved.push({
        id: existing.id,
        assignmentMetadata: tag.hasAssignmentMetadata
          ? tag.assignmentMetadata ?? Prisma.JsonNull
          : undefined,
      });
      continue; // eslint-disable-line no-continue
    }

    const definitionUpdate = {
      label: tag.label,
      description: tag.description,
      kind: tag.kind,
    };
    if (tag.hasMetadata) {
      definitionUpdate.metadata = tag.metadata ?? Prisma.JsonNull;
    }

    const definition = await client.topicTagDefinition.upsert({
      where: { slug: tag.slug },
      update: definitionUpdate,
      create: {
        slug: tag.slug,
        label: tag.label,
        description: tag.description,
        kind: tag.kind,
        metadata: tag.metadata ?? Prisma.JsonNull,
        createdById: actorId ?? null,
      },
    });

    resolved.push({
      id: definition.id,
      assignmentMetadata: tag.hasAssignmentMetadata
        ? tag.assignmentMetadata ?? Prisma.JsonNull
        : undefined,
    });
  }

  return resolved;
}

async function applyTopicTags(topicId, tags, { actorId, prismaClient }) {
  const client = prismaClient || prisma;
  if (!Array.isArray(tags)) {
    return;
  }

  const definitions = await resolveTopicTags(tags, { actorId, prismaClient: client });
  const desiredIds = definitions.map((item) => item.id);

  await client.topicTag.deleteMany({
    where: {
      topicId,
      NOT: {
        tagId: {
          in: desiredIds.length > 0 ? desiredIds : ['__none__'],
        },
      },
    },
  });

  await Promise.all(
    definitions.map((definition) => {
      const updateData = {
        assignedById: actorId ?? null,
      };
      if (definition.assignmentMetadata !== undefined) {
        updateData.metadata = definition.assignmentMetadata ?? Prisma.JsonNull;
      }

      const createData = {
        topicId,
        tagId: definition.id,
        assignedById: actorId ?? null,
      };
      if (definition.assignmentMetadata !== undefined) {
        createData.metadata = definition.assignmentMetadata ?? Prisma.JsonNull;
      }

      return client.topicTag.upsert({
        where: {
          topicId_tagId: {
            topicId,
            tagId: definition.id,
          },
        },
        update: updateData,
        create: createData,
      });
    }),
  );
}

function buildTopicUpdatePayload(payload = {}, { allowPartial = false } = {}) {
  const updates = {};

  if (!allowPartial || Object.prototype.hasOwnProperty.call(payload, 'title')) {
    const title = sanitizeString(payload.title, {
      field: 'Title',
      maxLength: TITLE_MAX_LENGTH,
      required: !allowPartial,
    });
    if (title !== null) {
      updates.title = title;
    }
  }

  if (!allowPartial || Object.prototype.hasOwnProperty.call(payload, 'summary')) {
    const summary = sanitizeString(payload.summary, {
      field: 'Summary',
      maxLength: SUMMARY_MAX_LENGTH,
      required: false,
    });
    updates.summary = summary;
  }

  if (!allowPartial || Object.prototype.hasOwnProperty.call(payload, 'language')) {
    updates.language = sanitizeLanguage(payload.language ?? DEFAULT_LANGUAGE);
  }

  let contentFormat = TopicContentFormat.JSON;
  if (!allowPartial || Object.prototype.hasOwnProperty.call(payload, 'contentFormat')) {
    const providedFormat = typeof payload.contentFormat === 'string' ? payload.contentFormat : null;
    if (providedFormat && !Object.values(TopicContentFormat).includes(providedFormat)) {
      throw AppError.badRequest('Unsupported topic content format provided.', {
        code: 'TOPIC_CONTENT_FORMAT_INVALID',
      });
    }
    contentFormat = providedFormat || TopicContentFormat.JSON;
    updates.contentFormat = contentFormat;
  }

  if (!allowPartial || Object.prototype.hasOwnProperty.call(payload, 'content')) {
    updates.content = sanitizeContent(payload.content, updates.contentFormat || contentFormat);
  }

  if (!allowPartial || Object.prototype.hasOwnProperty.call(payload, 'accessibility')) {
    updates.accessibility = sanitizeJsonObject(payload.accessibility);
  }

  if (!allowPartial || Object.prototype.hasOwnProperty.call(payload, 'metadata')) {
    updates.metadata = sanitizeJsonObject(payload.metadata);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'baseTopicId')) {
    updates.baseTopicId = payload.baseTopicId || null;
  }

  return updates;
}

async function fetchTopicOrThrow(topicId, { include = TOPIC_FULL_INCLUDE } = {}) {
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include,
  });

  if (!topic) {
    throw AppError.notFound('Topic not found.', {
      code: 'TOPIC_NOT_FOUND',
      details: { topicId },
    });
  }

  return topic;
}

async function recordWorkflowEvent(client, topicId, actorId, fromStatus, toStatus, note) {
  await client.topicWorkflowEvent.create({
    data: {
      topicId,
      actorId,
      fromStatus,
      toStatus,
      note: note || null,
    },
  });
}

async function createRevisionFromTopic(client, topic, { actorId, changeNotes }) {
  await client.topicRevision.create({
    data: {
      topicId: topic.id,
      version: topic.version,
      status: topic.status,
      title: topic.title,
      summary: topic.summary,
      content: topic.content,
      contentFormat: topic.contentFormat,
      accessibility: topic.accessibility,
      metadata: topic.metadata,
      changeNotes: changeNotes || null,
      createdById: actorId,
    },
  });
}

function actorCanAccessAllStatuses(actor) {
  if (!actor) {
    return false;
  }

  const roles = Array.isArray(actor.roles) ? actor.roles : [];
  return roles.some((role) => TOPIC_MANAGEMENT_ROLES.has(String(role).toLowerCase()));
}

export async function listTopics({
  filters = {},
  pagination = {},
  includeContent = false,
  actor = null,
} = {}) {
  const page = Math.max(1, Number.parseInt(pagination.page, 10) || 1);
  const pageSize = Math.max(1, Math.min(100, Number.parseInt(pagination.pageSize, 10) || 20));
  const skip = (page - 1) * pageSize;

  const where = {};
  const orConditions = [];

  const canViewAllStatuses = actorCanAccessAllStatuses(actor);

  if (canViewAllStatuses) {
    if (filters.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : String(filters.status).split(',');
      const normalizedStatuses = statuses
        .map((status) => status.trim().toUpperCase())
        .filter((status) => Object.values(TopicStatus).includes(status));
      if (normalizedStatuses.length > 0) {
        where.status = { in: normalizedStatuses };
      }
    }
  } else {
    where.status = TopicStatus.PUBLISHED;
  }

  if (filters.language) {
    const languages = Array.isArray(filters.language) ? filters.language : String(filters.language).split(',');
    const normalizedLanguages = languages.map((lang) => sanitizeLanguage(lang)).filter(Boolean);
    if (normalizedLanguages.length > 0) {
      where.language = { in: normalizedLanguages };
    }
  }

  if (filters.baseTopicId) {
    where.OR = [
      { id: filters.baseTopicId },
      { baseTopicId: filters.baseTopicId },
    ];
  }

  if (filters.tag) {
    const tags = Array.isArray(filters.tag) ? filters.tag : String(filters.tag).split(',');
    const normalizedTags = tags
      .map((tag) => (typeof tag === 'string' ? tag.trim().toLowerCase() : ''))
      .filter(Boolean);
    if (normalizedTags.length > 0) {
      where.tags = {
        some: {
          tag: {
            slug: { in: normalizedTags },
          },
        },
      };
    }
  }

  if (filters.search) {
    const term = String(filters.search || '').trim();
    if (term) {
      orConditions.push(
        { title: { contains: term, mode: 'insensitive' } },
        { summary: { contains: term, mode: 'insensitive' } },
      );
    }
  }

  if (orConditions.length > 0) {
    where.OR = where.OR ? [...where.OR, ...orConditions] : orConditions;
  }

  const [total, items] = await prisma.$transaction([
    prisma.topic.count({ where }),
    prisma.topic.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { updatedAt: 'desc' },
      include: TOPIC_SUMMARY_INCLUDE,
    }),
  ]);

  return {
    total,
    page,
    pageSize,
    items: items.map((topic) => toTopicResource(topic, { includeContent })),
  };
}

export async function getTopicById(topicId, { full = true, actor = null } = {}) {
  const topic = await fetchTopicOrThrow(topicId, {
    include: full ? TOPIC_FULL_INCLUDE : TOPIC_SUMMARY_INCLUDE,
  });

  if (!actorCanAccessAllStatuses(actor) && topic.status !== TopicStatus.PUBLISHED) {
    throw AppError.forbidden('Topic is not available for public viewing.', {
      code: 'TOPIC_NOT_PUBLISHED',
      details: { status: topic.status },
    });
  }

  return toTopicResource(topic, {
    includeContent: true,
    includeRevisions: full,
    includeWorkflow: full,
    includeComments: full,
  });
}

export async function createTopic(payload = {}, { actorId } = {}) {
  assertActor(actorId);

  const updates = buildTopicUpdatePayload(payload, { allowPartial: false });
  updates.authorId = actorId;
  updates.status = TopicStatus.DRAFT;
  updates.version = 1;

  if (updates.baseTopicId) {
    const baseTopic = await prisma.topic.findUnique({ where: { id: updates.baseTopicId } });
    if (!baseTopic) {
      throw AppError.notFound('Base topic for translation was not found.', {
        code: 'TOPIC_BASE_NOT_FOUND',
        details: { baseTopicId: updates.baseTopicId },
      });
    }
  }

  const tags = Array.isArray(payload.tags) ? payload.tags : [];
  const changeNotes = sanitizeString(payload.changeNotes, { field: 'Change notes', maxLength: 500 });

  const topic = await prisma.$transaction(async (tx) => {
    const tagDefinitions = await resolveTopicTags(tags, { actorId, prismaClient: tx });

    const created = await tx.topic.create({
      data: {
        ...updates,
        tags: {
          create: tagDefinitions.map((definition) => ({
            tag: { connect: { id: definition.id } },
            metadata: definition.assignmentMetadata ?? Prisma.JsonNull,
            assignedById: actorId,
          })),
        },
      },
      include: TOPIC_SUMMARY_INCLUDE,
    });

    await createRevisionFromTopic(tx, created, { actorId, changeNotes: changeNotes || 'Initial draft created.' });
    await recordWorkflowEvent(tx, created.id, actorId, null, TopicStatus.DRAFT, 'Draft created');

    return created;
  });

  logger.info('Topic draft created', {
    topicId: topic.id,
    actorId,
  });

  return toTopicResource(topic, { includeContent: true });
}

export async function updateTopic(topicId, payload = {}, { actorId } = {}) {
  assertActor(actorId);
  const existing = await fetchTopicOrThrow(topicId, { include: TOPIC_SUMMARY_INCLUDE });

  const allowedStatuses = [TopicStatus.DRAFT, TopicStatus.CHANGES_REQUESTED, TopicStatus.IN_REVIEW];
  const isPublished = existing.status === TopicStatus.PUBLISHED;

  if (!allowedStatuses.includes(existing.status) && !isPublished) {
    throw AppError.badRequest('Topic cannot be edited in its current status.', {
      code: 'TOPIC_UPDATE_STATUS_INVALID',
      details: { status: existing.status },
    });
  }

  if (isPublished && existing.authorId !== actorId) {
    throw AppError.forbidden('Only the original author can edit a published topic.', {
      code: 'TOPIC_UPDATE_AUTHOR_MISMATCH',
      details: { authorId: existing.authorId },
    });
  }

  const updates = buildTopicUpdatePayload(payload, { allowPartial: true });
  const tags = Object.prototype.hasOwnProperty.call(payload, 'tags') ? payload.tags : undefined;
  const changeNotes = sanitizeString(payload.changeNotes, { field: 'Change notes', maxLength: 500 });

  const nextVersion = existing.version + 1;
  const statusTransition = isPublished
    ? {
        status: TopicStatus.DRAFT,
        submittedAt: null,
        approvedAt: null,
        publishedAt: null,
        validatorId: null,
      }
    : {};
  const workflowNote = changeNotes || 'Draft updated.';

  const topic = await prisma.$transaction(async (tx) => {
    const updated = await tx.topic.update({
      where: { id: topicId },
      data: {
        ...updates,
        ...statusTransition,
        version: nextVersion,
      },
    });

    if (tags !== undefined) {
      await applyTopicTags(topicId, Array.isArray(tags) ? tags : [], { actorId, prismaClient: tx });
    }

    const revisionNotes = isPublished
      ? changeNotes || 'Published topic reopened for edits.'
      : workflowNote;
    await createRevisionFromTopic(tx, updated, { actorId, changeNotes: revisionNotes });

    if (isPublished) {
      await recordWorkflowEvent(
        tx,
        topicId,
        actorId,
        existing.status,
        TopicStatus.DRAFT,
        changeNotes || 'Returned published topic to draft for author revisions.',
      );
    }

    return tx.topic.findUnique({
      where: { id: topicId },
      include: TOPIC_SUMMARY_INCLUDE,
    });
  });

  logger.info('Topic draft updated', {
    topicId,
    actorId,
    status: topic.status,
  });

  return toTopicResource(topic, { includeContent: true });
}

export async function submitTopicForReview(topicId, payload = {}, { actorId } = {}) {
  assertActor(actorId);
  const existing = await fetchTopicOrThrow(topicId, { include: TOPIC_SUMMARY_INCLUDE });

  const allowedStatuses = [TopicStatus.DRAFT, TopicStatus.CHANGES_REQUESTED];
  if (!allowedStatuses.includes(existing.status)) {
    throw AppError.badRequest('Only drafts can be submitted for review.', {
      code: 'TOPIC_SUBMIT_INVALID_STATUS',
      details: { status: existing.status },
    });
  }

  if (existing.authorId !== actorId) {
    logger.warn('Topic submission attempted by non-author', {
      topicId,
      actorId,
      authorId: existing.authorId,
    });
  }

  const note = sanitizeString(payload.note, { field: 'Submission note', maxLength: 500 });
  const nextVersion = existing.version + 1;

  const topic = await prisma.$transaction(async (tx) => {
    const updated = await tx.topic.update({
      where: { id: topicId },
      data: {
        status: TopicStatus.IN_REVIEW,
        submittedAt: new Date(),
        version: nextVersion,
      },
    });

    await createRevisionFromTopic(tx, updated, { actorId, changeNotes: note || 'Submitted for review.' });
    await recordWorkflowEvent(tx, topicId, actorId, existing.status, TopicStatus.IN_REVIEW, note);

    return tx.topic.findUnique({
      where: { id: topicId },
      include: TOPIC_SUMMARY_INCLUDE,
    });
  });

  logger.info('Topic submitted for review', {
    topicId,
    actorId,
  });

  return toTopicResource(topic, { includeContent: true });
}

export async function reviewTopic(topicId, payload = {}, { actorId } = {}) {
  assertActor(actorId);
  const existing = await fetchTopicOrThrow(topicId, { include: TOPIC_SUMMARY_INCLUDE });

  if (existing.status !== TopicStatus.IN_REVIEW) {
    throw AppError.badRequest('Only topics in review can be decided.', {
      code: 'TOPIC_REVIEW_INVALID_STATUS',
      details: { status: existing.status },
    });
  }

  const decision = sanitizeString(payload.decision, { field: 'Decision', required: true, maxLength: 40 });
  const normalizedDecision = decision.toLowerCase();
  const notes = sanitizeString(payload.notes, { field: 'Review notes', maxLength: 800 });
  const tags = Object.prototype.hasOwnProperty.call(payload, 'tags') ? payload.tags : undefined;
  const updates = Object.prototype.hasOwnProperty.call(payload, 'updates') ? payload.updates : {};
  const nextVersion = existing.version + 1;

  let nextStatus = TopicStatus.IN_REVIEW;
  if (normalizedDecision === 'approve' || normalizedDecision === 'approved') {
    nextStatus = TopicStatus.APPROVED;
  } else if (normalizedDecision === 'changes_requested' || normalizedDecision === 'request_changes') {
    nextStatus = TopicStatus.CHANGES_REQUESTED;
  } else {
    throw AppError.badRequest('Unsupported review decision provided. Use "approve" or "changes_requested".', {
      code: 'TOPIC_REVIEW_DECISION_INVALID',
    });
  }

  const topic = await prisma.$transaction(async (tx) => {
    let updatePayload = {};
    if (updates && typeof updates === 'object' && Object.keys(updates).length > 0) {
      updatePayload = buildTopicUpdatePayload(updates, { allowPartial: true });
    }

    const updated = await tx.topic.update({
      where: { id: topicId },
      data: {
        ...updatePayload,
        status: nextStatus,
        validatorId: actorId,
        approvedAt: nextStatus === TopicStatus.APPROVED ? new Date() : null,
        version: nextVersion,
      },
    });

    if (tags !== undefined) {
      await applyTopicTags(topicId, Array.isArray(tags) ? tags : [], { actorId, prismaClient: tx });
    }

    await createRevisionFromTopic(tx, updated, {
      actorId,
      changeNotes:
        nextStatus === TopicStatus.APPROVED
          ? notes || 'Approved during review.'
          : notes || 'Changes requested during review.',
    });

    await recordWorkflowEvent(tx, topicId, actorId, existing.status, nextStatus, notes);

    return tx.topic.findUnique({
      where: { id: topicId },
      include: TOPIC_SUMMARY_INCLUDE,
    });
  });

  logger.info('Topic review completed', {
    topicId,
    actorId,
    decision: nextStatus,
  });

  return toTopicResource(topic, { includeContent: true });
}

export async function publishTopic(topicId, payload = {}, { actorId, actorRoles = [] } = {}) {
  assertActor(actorId);
  const roles = Array.isArray(actorRoles) ? actorRoles : [];
  const isAdmin = roles.includes('admin');
  const existing = await fetchTopicOrThrow(topicId, { include: TOPIC_SUMMARY_INCLUDE });

  if (![TopicStatus.APPROVED, TopicStatus.PUBLISHED].includes(existing.status)) {
    throw AppError.badRequest('Only approved topics can be published.', {
      code: 'TOPIC_PUBLISH_INVALID_STATUS',
      details: { status: existing.status },
    });
  }

  if (existing.authorId !== actorId && !isAdmin) {
    throw AppError.forbidden('Only the topic author can publish after approval.', {
      code: 'TOPIC_PUBLISH_AUTHOR_REQUIRED',
      details: { authorId: existing.authorId },
    });
  }

  if (!existing.validatorId) {
    throw AppError.badRequest('Topic must be validated by a teacher before publishing.', {
      code: 'TOPIC_PUBLISH_VALIDATION_REQUIRED',
    });
  }

  const metadata = Object.prototype.hasOwnProperty.call(payload, 'metadata') ? sanitizeJsonObject(payload.metadata) : undefined;
  const note = sanitizeString(payload.note, { field: 'Publish note', maxLength: 500 });
  const nextVersion = existing.version + 1;

  const topic = await prisma.$transaction(async (tx) => {
    const updated = await tx.topic.update({
      where: { id: topicId },
      data: {
        status: TopicStatus.PUBLISHED,
        publishedAt: new Date(),
        metadata: metadata === undefined ? existing.metadata : metadata,
        version: nextVersion,
      },
    });

    await createRevisionFromTopic(tx, updated, { actorId, changeNotes: note || 'Published topic version.' });
    await recordWorkflowEvent(tx, topicId, actorId, existing.status, TopicStatus.PUBLISHED, note);

    return tx.topic.findUnique({
      where: { id: topicId },
      include: TOPIC_SUMMARY_INCLUDE,
    });
  });

  logger.info('Topic published', {
    topicId,
    actorId,
  });

  return toTopicResource(topic, { includeContent: true });
}

export async function addTopicComment(topicId, payload = {}, { actorId } = {}) {
  assertActor(actorId);
  const exists = await prisma.topic.findUnique({
    where: { id: topicId },
    select: { id: true },
  });

  if (!exists) {
    throw AppError.notFound('Topic not found.', {
      code: 'TOPIC_NOT_FOUND',
      details: { topicId },
    });
  }

  const body = sanitizeString(payload.body, { field: 'Comment body', maxLength: 1200, required: true });
  const typeValue = sanitizeString(payload.type, { field: 'Comment type', maxLength: 40 });
  const normalizedType = typeValue ? typeValue.toUpperCase() : TopicCommentType.GENERAL;
  if (!Object.values(TopicCommentType).includes(normalizedType)) {
    throw AppError.badRequest('Unsupported comment type provided.', {
      code: 'TOPIC_COMMENT_TYPE_INVALID',
    });
  }

  const resolved = Boolean(payload.resolved);

  const comment = await prisma.topicComment.create({
    data: {
      topicId,
      authorId,
      type: normalizedType,
      body,
      resolvedAt: resolved ? new Date() : null,
      resolvedById: resolved ? actorId : null,
    },
    include: {
      author: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      resolvedBy: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  logger.info('Topic comment added', {
    topicId,
    actorId,
    commentId: comment.id,
  });

  return toCommentResource(comment);
}

export default {
  listTopics,
  getTopicById,
  createTopic,
  updateTopic,
  submitTopicForReview,
  reviewTopic,
  publishTopic,
  addTopicComment,
  toTopicResource,
};
