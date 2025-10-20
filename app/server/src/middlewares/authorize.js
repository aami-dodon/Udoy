import AppError from '../utils/appError.js';
import logger from '../utils/logger.js';
import getEnforcer from '../integrations/casbin/enforcer.js';

function defaultSubjectExtractor(req) {
  const { roles, role, email, id, sub } = req.user || {};

  if (Array.isArray(roles) && roles.length > 0) {
    return roles.map((roleName) => `role:${roleName}`);
  }

  if (role) {
    return [`role:${role}`];
  }

  return email || sub || id || null;
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

  return async function authorizeMiddleware(req, _res, next) {
    try {
      if (!req.user) {
        logger.warn('Authorization attempted without user context');
        const requestedResource = resolveValue(resource, req);
        const requestedAction = resolveValue(action, req);
        return next(
          AppError.unauthorized('Unauthorized', {
            code: 'AUTHORIZATION_REQUIRES_AUTHENTICATION',
            details: { resource: requestedResource, action: requestedAction },
          })
        );
      }

      const subjects = subjectExtractor(req);
      const obj = resolveValue(resource, req);
      const act = resolveValue(action, req);

      const subjectList = Array.isArray(subjects) ? subjects.filter(Boolean) : [subjects].filter(Boolean);

      if (subjectList.length === 0 || !obj || !act) {
        logger.error('Authorization check missing required parameters', {
          subjects: subjectList,
          obj,
          act,
        });
        return next(
          AppError.forbidden('Forbidden', {
            code: 'AUTHORIZATION_PARAMETERS_MISSING',
            details: { subjects: subjectList, obj, act },
          })
        );
      }

      const enforcer = await getEnforcer();

      for (const subject of subjectList) {
        const allowed = await enforcer.enforce(subject, obj, act);
        if (allowed) {
          return next();
        }
      }

      logger.warn('Request blocked by Casbin policy', {
        subjects: subjectList,
        obj,
        act,
        path: req.originalUrl,
        method: req.method,
      });
      return next(
        AppError.forbidden('Forbidden', {
          code: 'AUTHORIZATION_DENIED',
          details: { subjects: subjectList, obj, act },
        })
      );
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
