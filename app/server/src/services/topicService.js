import { Prisma, TopicReviewDecision, TopicStatus } from '@prisma/client';
import prisma from '../utils/prismaClient.js';
import AppError from '../utils/appError.js';
import logger from '../utils/logger.js';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function normalizeLanguage(language) {
  if (!language || typeof language !== 'string') {
    return null;
  }

  return language.trim().toLowerCase();
}

function normalizeString(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function sanitizeJson(value) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return Prisma.JsonNull;
  }

  return value;
}

function isDraftStatus(status) {
  return status === TopicStatus.DRAFT || status === TopicStatus.CHANGES_REQUESTED;
}

function ensureArray(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  return [value];
}

function buildTopicInclude({ includeContent = true, includeWorkflow = true, includeGroup = true } = {}) {
  return {
    ...(includeGroup
      ? {
          group: {
            include: {
              tags: {
                include: {
                  tag: true,
                },
              },
              alignments: true,
            },
          },
        }
      : {}),
    reviews: {
      orderBy: { createdAt: 'desc' },
    },
    workflowEvents: includeWorkflow
      ? {
          orderBy: { createdAt: 'desc' },
        }
      : false,
    ...(includeContent ? {} : { content: false }),
  };
}

function toTagDto(binding) {
  if (!binding?.tag) {
    return null;
  }

  return {
    id: binding.tag.id,
    name: binding.tag.name,
    type: binding.tag.type,
    description: binding.tag.description,
    metadata: binding.tag.metadata,
    assignedAt: binding.assignedAt,
    assignedById: binding.assignedById,
  };
}

function toAlignmentDto(alignment) {
  if (!alignment) {
    return null;
  }

  return {
    id: alignment.id,
    framework: alignment.framework,
    subject: alignment.subject,
    standardCode: alignment.standardCode,
    gradeLevel: alignment.gradeLevel,
    description: alignment.description,
    metadata: alignment.metadata,
    createdById: alignment.createdById,
    updatedById: alignment.updatedById,
    createdAt: alignment.createdAt,
    updatedAt: alignment.updatedAt,
  };
}

function toWorkflowEventDto(event) {
  if (!event) {
    return null;
  }

  return {
    id: event.id,
    topicId: event.topicId,
    actorId: event.actorId,
    fromStatus: event.fromStatus,
    toStatus: event.toStatus,
    decision: event.decision,
    comment: event.comment,
    metadata: event.metadata,
    createdAt: event.createdAt,
  };
}

function toReviewDto(review) {
  if (!review) {
    return null;
  }

  return {
    id: review.id,
    topicId: review.topicId,
    actorId: review.actorId,
    decision: review.decision,
    comment: review.comment,
    metadata: review.metadata,
    createdAt: review.createdAt,
  };
}

function toTopicDto(topic, { includeContent = true } = {}) {
  if (!topic) {
    return null;
  }

  const group = topic.group
    ? {
        id: topic.group.id,
        slug: topic.group.slug,
        defaultLanguage: topic.group.defaultLanguage,
        summary: topic.group.summary,
        archivedAt: topic.group.archivedAt,
        metadata: topic.group.metadata,
        createdById: topic.group.createdById,
        updatedById: topic.group.updatedById,
        createdAt: topic.group.createdAt,
        updatedAt: topic.group.updatedAt,
        tags: (topic.group.tags || []).map(toTagDto).filter(Boolean),
        alignments: (topic.group.alignments || []).map(toAlignmentDto).filter(Boolean),
      }
    : undefined;

  return {
    id: topic.id,
    groupId: topic.groupId,
    language: topic.language,
    title: topic.title,
    summary: topic.summary,
    content: includeContent ? topic.content : undefined,
    status: topic.status,
    version: topic.version,
    isLatest: topic.isLatest,
    metadata: topic.metadata,
    accessibility: topic.accessibility,
    notes: topic.notes,
    createdById: topic.createdById,
    updatedById: topic.updatedById,
    submittedById: topic.submittedById,
    reviewedById: topic.reviewedById,
    publishedById: topic.publishedById,
    submittedAt: topic.submittedAt,
    publishedAt: topic.publishedAt,
    statusChangedAt: topic.statusChangedAt,
    supersedesId: topic.supersedesId,
    createdAt: topic.createdAt,
    updatedAt: topic.updatedAt,
    group,
    reviews: (topic.reviews || []).map(toReviewDto).filter(Boolean),
    workflow: (topic.workflowEvents || []).map(toWorkflowEventDto).filter(Boolean),
  };
}

function coercePagination(query = {}) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const pageSize = Math.max(1, Math.min(MAX_PAGE_SIZE, Number.parseInt(query.pageSize, 10) || DEFAULT_PAGE_SIZE));
  return { page, pageSize };
}

function normalizeTagInput(tag) {
  if (!tag) {
    return null;
  }

  if (typeof tag === 'string') {
    const name = normalizeString(tag);
    if (!name) {
      return null;
    }
    return {
      name,
      type: 'classification',
    };
  }

  const name = normalizeString(tag.name);
  if (!name) {
    return null;
  }

  const type = normalizeString(tag.type) || 'classification';
  const description = normalizeString(tag.description);
  const metadata = tag.metadata && typeof tag.metadata === 'object' ? tag.metadata : undefined;

  return {
    id: tag.id,
    name,
    type,
    description,
    metadata,
  };
}

async function ensureTag(tx, tag, { actorId } = {}) {
  const normalized = normalizeTagInput(tag);
  if (!normalized) {
    return null;
  }

  if (normalized.id) {
    const existing = await tx.tag.findUnique({ where: { id: normalized.id } });
    if (existing) {
      if (
        existing.name !== normalized.name ||
        existing.type !== normalized.type ||
        existing.description !== normalized.description ||
        JSON.stringify(existing.metadata || null) !== JSON.stringify(normalized.metadata || null)
      ) {
        return tx.tag.update({
          where: { id: existing.id },
          data: {
            name: normalized.name,
            type: normalized.type,
            description: normalized.description,
            metadata: sanitizeJson(normalized.metadata ?? null),
          },
        });
      }
      return existing;
    }
  }

  try {
    return await tx.tag.upsert({
      where: {
        name_type: {
          name: normalized.name,
          type: normalized.type,
        },
      },
      create: {
        name: normalized.name,
        type: normalized.type,
        description: normalized.description,
        metadata: sanitizeJson(normalized.metadata ?? null),
      },
      update: {
        description: normalized.description,
        metadata: sanitizeJson(normalized.metadata ?? null),
      },
    });
  } catch (error) {
    logger.error('Failed to upsert tag', {
      error: error.message,
      name: normalized.name,
      type: normalized.type,
      actorId,
    });
    throw error;
  }
}

async function syncGroupTags(tx, groupId, tags, { actorId } = {}) {
  if (!tags) {
    return;
  }

  const normalizedTags = ensureArray(tags)
    .map((tag) => normalizeTagInput(tag))
    .filter(Boolean);

  const uniqueKeyed = new Map();
  for (const tag of normalizedTags) {
    const key = `${tag.type}:${tag.name}`;
    if (!uniqueKeyed.has(key)) {
      uniqueKeyed.set(key, tag);
    }
  }

  const ensuredTags = await Promise.all(
    Array.from(uniqueKeyed.values()).map((tag) => ensureTag(tx, tag, { actorId }))
  );

  const tagIds = ensuredTags.filter(Boolean).map((tag) => tag.id);

  const existingBindings = await tx.topicGroupTag.findMany({
    where: { groupId },
  });

  const existingIds = new Set(existingBindings.map((binding) => binding.tagId));
  const desiredIds = new Set(tagIds);

  const bindingsToRemove = existingBindings.filter((binding) => !desiredIds.has(binding.tagId));
  const bindingsToAdd = tagIds.filter((id) => !existingIds.has(id));

  if (bindingsToRemove.length > 0) {
    await tx.topicGroupTag.deleteMany({
      where: {
        groupId,
        tagId: { in: bindingsToRemove.map((binding) => binding.tagId) },
      },
    });
  }

  if (bindingsToAdd.length > 0) {
    await tx.topicGroupTag.createMany({
      data: bindingsToAdd.map((tagId) => ({
        groupId,
        tagId,
        assignedById: actorId || null,
      })),
      skipDuplicates: true,
    });
  }
}

function normalizeAlignmentInput(alignment) {
  if (!alignment || typeof alignment !== 'object') {
    return null;
  }

  const framework = normalizeString(alignment.framework);
  const subject = normalizeString(alignment.subject);
  const standardCode = normalizeString(alignment.standardCode);
  const gradeLevel = normalizeString(alignment.gradeLevel);
  const description = normalizeString(alignment.description);
  const metadata = alignment.metadata && typeof alignment.metadata === 'object' ? alignment.metadata : undefined;

  if (!framework && !standardCode && !description) {
    return null;
  }

  return {
    id: alignment.id,
    framework,
    subject,
    standardCode,
    gradeLevel,
    description,
    metadata,
  };
}

async function syncCurriculumAlignments(tx, groupId, alignments, { actorId } = {}) {
  if (!alignments) {
    return;
  }

  const normalizedAlignments = ensureArray(alignments)
    .map((alignment) => normalizeAlignmentInput(alignment))
    .filter(Boolean);

  const existingAlignments = await tx.topicCurriculumAlignment.findMany({
    where: { groupId },
  });

  const existingMap = new Map(existingAlignments.map((alignment) => [alignment.id, alignment]));
  const retainedIds = new Set();

  for (const alignment of normalizedAlignments) {
    if (alignment.id && existingMap.has(alignment.id)) {
      await tx.topicCurriculumAlignment.update({
        where: { id: alignment.id },
        data: {
          framework: alignment.framework,
          subject: alignment.subject,
          standardCode: alignment.standardCode,
          gradeLevel: alignment.gradeLevel,
          description: alignment.description,
          metadata: sanitizeJson(alignment.metadata ?? null),
          updatedById: actorId || null,
        },
      });
      retainedIds.add(alignment.id);
    } else {
      const created = await tx.topicCurriculumAlignment.create({
        data: {
          groupId,
          framework: alignment.framework,
          subject: alignment.subject,
          standardCode: alignment.standardCode,
          gradeLevel: alignment.gradeLevel,
          description: alignment.description,
          metadata: sanitizeJson(alignment.metadata ?? null),
          createdById: actorId || null,
          updatedById: actorId || null,
        },
      });
      retainedIds.add(created.id);
    }
  }

  const idsToRemove = existingAlignments
    .filter((alignment) => !retainedIds.has(alignment.id))
    .map((alignment) => alignment.id);

  if (idsToRemove.length > 0) {
    await tx.topicCurriculumAlignment.deleteMany({
      where: {
        id: { in: idsToRemove },
      },
    });
  }
}

async function logWorkflowEvent(tx, topicId, { actorId, fromStatus, toStatus, decision, comment, metadata } = {}) {
  await tx.topicWorkflowEvent.create({
    data: {
      topicId,
      actorId: actorId || null,
      fromStatus: fromStatus || null,
      toStatus,
      decision: decision || null,
      comment: comment || null,
      metadata: sanitizeJson(metadata ?? null),
    },
  });
}

export async function listTopics(query = {}) {
  const { page, pageSize } = coercePagination(query);
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const where = {};
  if (query.status) {
    const normalizedStatus = String(query.status).trim().toUpperCase();
    if (normalizedStatus in TopicStatus) {
      where.status = TopicStatus[normalizedStatus];
    }
  }

  const language = normalizeLanguage(query.language);
  if (language) {
    where.language = language;
  }

  if (query.latest !== 'false') {
    where.isLatest = true;
  }

  const searchTerm = normalizeString(query.search || query.q);
  if (searchTerm) {
    where.OR = [
      { title: { contains: searchTerm, mode: 'insensitive' } },
      { summary: { contains: searchTerm, mode: 'insensitive' } },
    ];
  }

  const groupConditions = [];
  if (!query.includeArchived) {
    groupConditions.push({ archivedAt: null });
  }

  if (query.groupId) {
    groupConditions.push({ id: String(query.groupId) });
  }

  const tagNames = ensureArray(query.tags || query.tag)
    .map((value) => normalizeString(String(value)))
    .filter(Boolean);
  const tagIds = ensureArray(query.tagIds)
    .map((value) => {
      const parsed = Number.parseInt(value, 10);
      return Number.isNaN(parsed) ? null : parsed;
    })
    .filter((value) => value !== null);

  if (tagNames.length > 0 || tagIds.length > 0) {
    groupConditions.push({
      tags: {
        some: {
          tag: {
            OR: [
              ...(tagNames.length > 0
                ? [
                    {
                      name: {
                        in: tagNames,
                        mode: 'insensitive',
                      },
                    },
                  ]
                : []),
              ...(tagIds.length > 0 ? [{ id: { in: tagIds } }] : []),
            ],
          },
        },
      },
    });
  }

  if (groupConditions.length > 0) {
    where.group = { AND: groupConditions };
  }

  const [items, total] = await prisma.$transaction([
    prisma.topic.findMany({
      where,
      include: buildTopicInclude({ includeContent: false }),
      orderBy: [
        { status: 'asc' },
        { updatedAt: 'desc' },
      ],
      skip,
      take,
    }),
    prisma.topic.count({ where }),
  ]);

  return {
    items: items.map((topic) => toTopicDto(topic, { includeContent: false })),
    page,
    pageSize,
    total,
  };
}

export async function getTopicById(id, { includeContent = true } = {}) {
  if (!id) {
    return null;
  }

  const topic = await prisma.topic.findUnique({
    where: { id: String(id) },
    include: buildTopicInclude({ includeContent }),
  });

  return toTopicDto(topic, { includeContent });
}

export async function getTopicHistory(id) {
  if (!id) {
    throw AppError.badRequest('Topic identifier is required to fetch history.');
  }

  const topic = await prisma.topic.findUnique({
    where: { id: String(id) },
  });

  if (!topic) {
    throw AppError.notFound('Topic not found.', { code: 'TOPIC_NOT_FOUND' });
  }

  const history = await prisma.topic.findMany({
    where: {
      groupId: topic.groupId,
      language: topic.language,
    },
    orderBy: { version: 'desc' },
    include: buildTopicInclude({ includeContent: false }),
  });

  return history.map((item) => toTopicDto(item, { includeContent: false }));
}

async function assertGroupLanguageAvailability(tx, groupId, language) {
  const existing = await tx.topic.findFirst({
    where: {
      groupId,
      language,
      isLatest: true,
    },
  });

  return existing;
}

export async function createTopic(payload = {}, { actorId } = {}) {
  const language = normalizeLanguage(payload.language) || 'en';
  const title = normalizeString(payload.title);
  const content = payload.content;

  if (!title) {
    throw AppError.badRequest('Topic title is required.');
  }

  if (!content) {
    throw AppError.badRequest('Topic content is required.');
  }

  const result = await prisma.$transaction(async (tx) => {
    let groupId = payload.groupId ? String(payload.groupId) : null;
    let supersedes = null;
    let version = 1;

    let previousLatest = null;

    if (groupId) {
      const group = await tx.topicGroup.findUnique({ where: { id: groupId } });
      if (!group) {
        throw AppError.notFound('Topic group not found.', { code: 'TOPIC_GROUP_NOT_FOUND' });
      }

      previousLatest = await assertGroupLanguageAvailability(tx, groupId, language);
      if (previousLatest) {
        supersedes = previousLatest.id;
        version = previousLatest.version + 1;
        await tx.topic.update({
          where: { id: previousLatest.id },
          data: { isLatest: false },
        });
      }

      if (payload.summary && group.summary !== payload.summary) {
        await tx.topicGroup.update({
          where: { id: groupId },
          data: {
            summary: payload.summary,
            updatedById: actorId || null,
            metadata: sanitizeJson(payload.groupMetadata ?? group.metadata ?? null),
          },
        });
      }
    } else {
      const group = await tx.topicGroup.create({
        data: {
          defaultLanguage: language,
          summary: payload.summary || null,
          metadata: sanitizeJson(payload.groupMetadata ?? null),
          createdById: actorId || null,
          updatedById: actorId || null,
        },
      });
      groupId = group.id;
    }

    const topic = await tx.topic.create({
      data: {
        groupId,
        language,
        title,
        summary: payload.summary || null,
        content,
        metadata: sanitizeJson(payload.metadata ?? null),
        accessibility: sanitizeJson(payload.accessibility ?? null),
        notes: payload.notes || null,
        status: TopicStatus.DRAFT,
        version,
        isLatest: true,
        createdById: actorId || null,
        updatedById: actorId || null,
        supersedesId: supersedes,
      },
      include: buildTopicInclude(),
    });

    await logWorkflowEvent(tx, topic.id, {
      actorId,
      fromStatus: previousLatest?.status || null,
      toStatus: TopicStatus.DRAFT,
      comment: payload.notes,
      metadata: {
        action: 'CREATE',
        supersedes,
      },
    });

    await syncGroupTags(tx, groupId, payload.tags, { actorId });
    await syncCurriculumAlignments(tx, groupId, payload.alignments, { actorId });

    return topic;
  });

  return toTopicDto(result);
}

export async function updateTopic(id, payload = {}, { actorId } = {}) {
  if (!id) {
    throw AppError.badRequest('Topic identifier is required.');
  }

  const result = await prisma.$transaction(async (tx) => {
    const topic = await tx.topic.findUnique({ where: { id: String(id) }, include: buildTopicInclude() });
    if (!topic) {
      throw AppError.notFound('Topic not found.', { code: 'TOPIC_NOT_FOUND' });
    }

    if (!isDraftStatus(topic.status)) {
      throw AppError.badRequest('Only draft topics can be modified.', {
        code: 'TOPIC_NOT_EDITABLE',
        details: { status: topic.status },
      });
    }

    const data = {};
    const title = normalizeString(payload.title);
    if (title && title !== topic.title) {
      data.title = title;
    }

    if (payload.summary !== undefined) {
      data.summary = payload.summary || null;
    }

    if (payload.content) {
      data.content = payload.content;
    }

    if (payload.metadata !== undefined) {
      data.metadata = sanitizeJson(payload.metadata ?? null);
    }

    if (payload.accessibility !== undefined) {
      data.accessibility = sanitizeJson(payload.accessibility ?? null);
    }

    if (payload.notes !== undefined) {
      data.notes = payload.notes || null;
    }

    if (Object.keys(data).length > 0) {
      data.updatedById = actorId || null;
      await tx.topic.update({
        where: { id: topic.id },
        data,
      });
    }

    if (payload.tags !== undefined) {
      await syncGroupTags(tx, topic.groupId, payload.tags, { actorId });
    }

    if (payload.alignments !== undefined) {
      await syncCurriculumAlignments(tx, topic.groupId, payload.alignments, { actorId });
    }

    if (payload.groupMetadata !== undefined || payload.groupSummary !== undefined) {
      await tx.topicGroup.update({
        where: { id: topic.groupId },
        data: {
          metadata: payload.groupMetadata === undefined ? undefined : sanitizeJson(payload.groupMetadata ?? null),
          summary: payload.groupSummary === undefined ? undefined : payload.groupSummary || null,
          updatedById: actorId || null,
        },
      });
    }

    const updated = await tx.topic.findUnique({
      where: { id: topic.id },
      include: buildTopicInclude(),
    });

    return updated;
  });

  return toTopicDto(result);
}

export async function submitTopicForReview(id, { actorId, comment } = {}) {
  if (!id) {
    throw AppError.badRequest('Topic identifier is required.');
  }

  const topic = await prisma.topic.findUnique({ where: { id: String(id) } });
  if (!topic) {
    throw AppError.notFound('Topic not found.', { code: 'TOPIC_NOT_FOUND' });
  }

  if (!isDraftStatus(topic.status)) {
    throw AppError.badRequest('Only drafts can be submitted for review.', {
      code: 'TOPIC_NOT_SUBMITTABLE',
      details: { status: topic.status },
    });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const next = await tx.topic.update({
      where: { id: topic.id },
      data: {
        status: TopicStatus.IN_REVIEW,
        submittedById: actorId || null,
        submittedAt: new Date(),
        statusChangedAt: new Date(),
        updatedById: actorId || topic.updatedById,
      },
      include: buildTopicInclude(),
    });

    await logWorkflowEvent(tx, topic.id, {
      actorId,
      fromStatus: topic.status,
      toStatus: TopicStatus.IN_REVIEW,
      comment,
      metadata: {
        action: 'SUBMIT',
      },
    });

    return next;
  });

  return toTopicDto(updated);
}

export async function recordReviewDecision(id, { actorId, decision, comment, metadata } = {}) {
  if (!id) {
    throw AppError.badRequest('Topic identifier is required.');
  }

  const topic = await prisma.topic.findUnique({ where: { id: String(id) } });
  if (!topic) {
    throw AppError.notFound('Topic not found.', { code: 'TOPIC_NOT_FOUND' });
  }

  if (topic.status !== TopicStatus.IN_REVIEW) {
    throw AppError.badRequest('Topic must be in review to record a decision.', {
      code: 'TOPIC_NOT_IN_REVIEW',
      details: { status: topic.status },
    });
  }

  const normalizedDecision = String(decision || '').toUpperCase();
  const decisionValue = TopicReviewDecision[normalizedDecision];
  if (!decisionValue) {
    throw AppError.badRequest('Invalid review decision supplied.', {
      code: 'TOPIC_REVIEW_DECISION_INVALID',
    });
  }

  const nextStatus =
    decisionValue === TopicReviewDecision.APPROVED
      ? TopicStatus.APPROVED
      : TopicStatus.CHANGES_REQUESTED;

  const updated = await prisma.$transaction(async (tx) => {
    const nextTopic = await tx.topic.update({
      where: { id: topic.id },
      data: {
        status: nextStatus,
        reviewedById: actorId || null,
        statusChangedAt: new Date(),
        notes: nextStatus === TopicStatus.CHANGES_REQUESTED ? comment || topic.notes : topic.notes,
        updatedById: actorId || topic.updatedById,
      },
      include: buildTopicInclude(),
    });

    await tx.topicReview.create({
      data: {
        topicId: topic.id,
        actorId: actorId || null,
        decision: decisionValue,
        comment: comment || null,
        metadata: sanitizeJson(metadata ?? null),
      },
    });

    await logWorkflowEvent(tx, topic.id, {
      actorId,
      fromStatus: topic.status,
      toStatus: nextStatus,
      decision: decisionValue,
      comment,
      metadata: {
        action: 'REVIEW',
      },
    });

    return nextTopic;
  });

  return toTopicDto(updated);
}

export async function publishTopic(id, { actorId, comment } = {}) {
  if (!id) {
    throw AppError.badRequest('Topic identifier is required.');
  }

  const topic = await prisma.topic.findUnique({ where: { id: String(id) } });
  if (!topic) {
    throw AppError.notFound('Topic not found.', { code: 'TOPIC_NOT_FOUND' });
  }

  if (topic.status !== TopicStatus.APPROVED) {
    throw AppError.badRequest('Only approved topics can be published.', {
      code: 'TOPIC_NOT_APPROVED',
      details: { status: topic.status },
    });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const published = await tx.topic.update({
      where: { id: topic.id },
      data: {
        status: TopicStatus.PUBLISHED,
        publishedAt: new Date(),
        publishedById: actorId || null,
        statusChangedAt: new Date(),
        updatedById: actorId || topic.updatedById,
      },
      include: buildTopicInclude(),
    });

    await logWorkflowEvent(tx, topic.id, {
      actorId,
      fromStatus: topic.status,
      toStatus: TopicStatus.PUBLISHED,
      comment,
      metadata: {
        action: 'PUBLISH',
      },
    });

    return published;
  });

  return toTopicDto(updated);
}

export async function createTopicRevision(id, { actorId, notes } = {}) {
  if (!id) {
    throw AppError.badRequest('Topic identifier is required.');
  }

  const source = await prisma.topic.findUnique({
    where: { id: String(id) },
    include: buildTopicInclude(),
  });

  if (!source) {
    throw AppError.notFound('Topic not found.', { code: 'TOPIC_NOT_FOUND' });
  }

  if (source.status !== TopicStatus.PUBLISHED) {
    throw AppError.badRequest('Only published topics can be revised.', {
      code: 'TOPIC_NOT_PUBLISHED',
      details: { status: source.status },
    });
  }

  const result = await prisma.$transaction(async (tx) => {
    const latest = await tx.topic.findFirst({
      where: {
        groupId: source.groupId,
        language: source.language,
        isLatest: true,
      },
      orderBy: { version: 'desc' },
    });

    if (latest && latest.id !== source.id) {
      throw AppError.badRequest('A newer draft already exists for this topic.', {
        code: 'TOPIC_REVISION_EXISTS',
      });
    }

    await tx.topic.update({
      where: { id: source.id },
      data: { isLatest: false },
    });

    const created = await tx.topic.create({
      data: {
        groupId: source.groupId,
        language: source.language,
        title: source.title,
        summary: source.summary,
        content: source.content,
        metadata: source.metadata,
        accessibility: source.accessibility,
        notes: notes || source.notes,
        status: TopicStatus.DRAFT,
        version: source.version + 1,
        isLatest: true,
        createdById: source.createdById || actorId || null,
        updatedById: actorId || source.updatedById,
        supersedesId: source.id,
      },
      include: buildTopicInclude(),
    });

    await logWorkflowEvent(tx, created.id, {
      actorId,
      fromStatus: source.status,
      toStatus: TopicStatus.DRAFT,
      comment: notes,
      metadata: {
        action: 'REVISION_CREATE',
        supersedes: source.id,
      },
    });

    return created;
  });

  return toTopicDto(result);
}

export default {
  listTopics,
  getTopicById,
  getTopicHistory,
  createTopic,
  updateTopic,
  submitTopicForReview,
  recordReviewDecision,
  publishTopic,
  createTopicRevision,
};
