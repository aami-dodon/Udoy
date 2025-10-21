import AppError from '../../utils/appError.js';
import {
  listTopics as listTopicsService,
  getTopicById as getTopicByIdService,
  getTopicHistory as getTopicHistoryService,
  createTopic as createTopicService,
  updateTopic as updateTopicService,
  submitTopicForReview as submitTopicService,
  recordReviewDecision as recordReviewDecisionService,
  publishTopic as publishTopicService,
  createTopicRevision as createTopicRevisionService,
} from '../../services/topicService.js';

function getActorId(req) {
  return req.user?.sub || req.user?.id || null;
}

export async function listTopics(req, res, next) {
  try {
    const result = await listTopicsService(req.query);
    return res.json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

export async function createTopic(req, res, next) {
  try {
    const topic = await createTopicService(req.body || {}, { actorId: getActorId(req) });
    return res.status(201).json({
      status: 'success',
      data: { topic },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getTopic(req, res, next) {
  try {
    const { id } = req.params;
    const topic = await getTopicByIdService(id, { includeContent: true });
    if (!topic) {
      throw AppError.notFound('Topic not found.', { code: 'TOPIC_NOT_FOUND' });
    }

    return res.json({
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
    const topic = await updateTopicService(id, req.body || {}, { actorId: getActorId(req) });
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
    const topic = await submitTopicService(id, {
      actorId: getActorId(req),
      comment: req.body?.comment,
    });

    return res.json({
      status: 'success',
      data: { topic },
    });
  } catch (error) {
    return next(error);
  }
}

export async function recordReviewDecision(req, res, next) {
  try {
    const { id } = req.params;
    const { decision, comment, metadata } = req.body || {};
    const topic = await recordReviewDecisionService(id, {
      actorId: getActorId(req),
      decision,
      comment,
      metadata,
    });

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
    const topic = await publishTopicService(id, {
      actorId: getActorId(req),
      comment: req.body?.comment,
    });

    return res.json({
      status: 'success',
      data: { topic },
    });
  } catch (error) {
    return next(error);
  }
}

export async function createTopicRevision(req, res, next) {
  try {
    const { id } = req.params;
    const topic = await createTopicRevisionService(id, {
      actorId: getActorId(req),
      notes: req.body?.notes,
    });

    return res.status(201).json({
      status: 'success',
      data: { topic },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getTopicHistory(req, res, next) {
  try {
    const { id } = req.params;
    const history = await getTopicHistoryService(id);
    return res.json({
      status: 'success',
      data: { history },
    });
  } catch (error) {
    return next(error);
  }
}

export default {
  listTopics,
  createTopic,
  getTopic,
  updateTopic,
  submitTopicForReview,
  recordReviewDecision,
  publishTopic,
  createTopicRevision,
  getTopicHistory,
};
