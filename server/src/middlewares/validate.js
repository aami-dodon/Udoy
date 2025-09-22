import { validationResult } from 'express-validator';

import { ApplicationError } from '../utils/errors.js';

export const validate = (rules = []) => async (req, res, next) => {
  await Promise.all(rules.map((rule) => rule.run(req)));

  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  const details = result.array().map(({ path, msg }) => ({
    field: path,
    message: msg
  }));

  return next(new ApplicationError('Validation failed', 422, {
    code: 'VALIDATION_ERROR',
    details
  }));
};
