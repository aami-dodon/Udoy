import logger from '../utils/logger.js';
import getEnforcer from '../integrations/casbin/enforcer.js';

function defaultSubjectExtractor(req) {
  return req.user?.role || req.user?.email || req.user?.id || null;
}

function resolveValue(valueOrFactory, req) {
  if (typeof valueOrFactory === 'function') {
    return valueOrFactory(req);
  }

  return valueOrFactory;
}

export default function authorize({
  subjectExtractor = defaultSubjectExtractor,
  resource,
  action,
} = {}) {
  if (!resource || !action) {
    throw new Error('authorize middleware requires both "resource" and "action" options');
  }

  return async function authorizeMiddleware(req, res, next) {
    try {
      if (!req.user) {
        logger.warn('Authorization attempted without user context');
        return res.status(401).json({ status: 'error', message: 'Unauthorized' });
      }

      const sub = subjectExtractor(req);
      const obj = resolveValue(resource, req);
      const act = resolveValue(action, req);

      if (!sub || !obj || !act) {
        logger.error('Authorization check missing required parameters', {
          sub,
          obj,
          act,
        });
        return res.status(403).json({ status: 'error', message: 'Forbidden' });
      }

      const enforcer = await getEnforcer();
      const allowed = await enforcer.enforce(sub, obj, act);

      if (!allowed) {
        logger.warn('Request blocked by Casbin policy', {
          sub,
          obj,
          act,
          path: req.originalUrl,
          method: req.method,
        });
        return res.status(403).json({ status: 'error', message: 'Forbidden' });
      }

      return next();
    } catch (error) {
      logger.error('Casbin authorization failed', {
        error: error.message,
        path: req.originalUrl,
        method: req.method,
      });
      return next(error);
    }
  };
}
