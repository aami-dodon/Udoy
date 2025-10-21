import {
  listTopics as listTopicsService,
  getTopicById as getTopicByIdService,
  createTopic as createTopicService,
  updateTopic as updateTopicService,
  submitTopicForReview as submitTopicForReviewService,
  reviewTopic as reviewTopicService,
  publishTopic as publishTopicService,
  addTopicComment as addTopicCommentService,
} from '../../services/topicService.js';

function parseBoolean(value, defaultValue = false) {
  if (value == null) {
    return defaultValue;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  const normalized = String(value).trim().toLowerCase();
  if (['true', '1', 'yes', 'y'].includes(normalized)) {
    return true;
  }
  if (['false', '0', 'no', 'n'].includes(normalized)) {
    return false;
  }

  return defaultValue;
}

export async function listTopics(req, res, next) {
  try {
    const { status, language, tag, search, baseTopicId, page, pageSize, includeContent } = req.query || {};

    const result = await listTopicsService({
      filters: {
        status,
        language,
        tag,
        search,
        baseTopicId,
      },
      pagination: { page, pageSize },
      includeContent: parseBoolean(includeContent, false),
    });

    return res.json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getTopic(req, res, next) {
  try {
    const { id } = req.params;
    const includeFull = parseBoolean(req.query?.full, true);
    const topic = await getTopicByIdService(id, { full: includeFull });

    return res.json({
      status: 'success',
      data: { topic },
    });
  } catch (error) {
    return next(error);
  }
}

export async function createTopic(req, res, next) {
  try {
    const actorId = req.user?.sub || null;
    const topic = await createTopicService(req.body || {}, { actorId });
    return res.status(201).json({
      status: 'success',
      data: { topic },
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateTopic(req, res, next) {
  try {
    const { id } = req.params;
    const actorId = req.user?.sub || null;
    const topic = await updateTopicService(id, req.body || {}, { actorId });

    return res.json({
      status: 'success',
      data: { topic },
    });
  } catch (error) {
    return next(error);
  }
}

export async function submitTopicForReview(req, res, next) {
  try {
    const { id } = req.params;
    const actorId = req.user?.sub || null;
    const topic = await submitTopicForReviewService(id, req.body || {}, { actorId });

    return res.json({
      status: 'success',
      data: { topic },
    });
  } catch (error) {
    return next(error);
  }
}

export async function reviewTopic(req, res, next) {
  try {
    const { id } = req.params;
    const actorId = req.user?.sub || null;
    const topic = await reviewTopicService(id, req.body || {}, { actorId });

    return res.json({
      status: 'success',
      data: { topic },
    });
  } catch (error) {
    return next(error);
  }
}

export async function publishTopic(req, res, next) {
  try {
    const { id } = req.params;
    const actorId = req.user?.sub || null;
    const topic = await publishTopicService(id, req.body || {}, { actorId });

    return res.json({
      status: 'success',
      data: { topic },
    });
  } catch (error) {
    return next(error);
  }
}

export async function addTopicComment(req, res, next) {
  try {
    const { id } = req.params;
    const actorId = req.user?.sub || null;
    const comment = await addTopicCommentService(id, req.body || {}, { actorId });

    return res.status(201).json({
      status: 'success',
      data: { comment },
    });
  } catch (error) {
    return next(error);
  }
}

export default {
  listTopics,
  getTopic,
  createTopic,
  updateTopic,
  submitTopicForReview,
  reviewTopic,
  publishTopic,
  addTopicComment,
};
