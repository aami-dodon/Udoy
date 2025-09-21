import { verifyToken } from '../utils/jwt.js';
import { ApplicationError } from '../utils/errors.js';

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return next(new ApplicationError('Unauthorized', 401));
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch (error) {
    return next(new ApplicationError('Unauthorized', 401));
  }
};

export const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new ApplicationError('Unauthorized', 401));
  }
  if (roles.length && !roles.includes(req.user.role)) {
    return next(new ApplicationError('Forbidden', 403));
  }
  return next();
};
