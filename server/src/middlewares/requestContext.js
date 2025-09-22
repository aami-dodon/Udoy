import { randomUUID } from 'node:crypto';

export const requestContext = (req, res, next) => {
  if (!req.id) {
    req.id = randomUUID();
  }
  res.setHeader('X-Request-Id', req.id);
  next();
};
