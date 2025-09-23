/**
 * Restrict access to users matching allowed roles.
 * @param {string[]} roles Allowed roles.
 * @returns {import('express').RequestHandler} Middleware function.
 */
export function authorizeRoles(roles = []) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    return next();
  };
}
