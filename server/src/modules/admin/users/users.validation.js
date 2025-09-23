import { body, param } from 'express-validator';

import { ROLES } from '../../../../../shared/constants/index.js';

export const updateAdminUserValidation = [
  param('id').isUUID().withMessage('User id must be a valid UUID'),
  body()
    .custom((value, { req }) => {
      const { name, role, isVerified, isActive } = req.body;
      if (
        typeof name === 'undefined' &&
        typeof role === 'undefined' &&
        typeof isVerified === 'undefined' &&
        typeof isActive === 'undefined'
      ) {
        throw new Error('No updates provided');
      }
      return true;
    })
    .withMessage('No updates provided'),
  body('name')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('Name must be a string')
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ max: 120 })
    .withMessage('Name must be 120 characters or fewer'),
  body('role')
    .optional()
    .isIn(Object.values(ROLES))
    .withMessage('Role must be student, teacher, or admin'),
  body('isVerified')
    .optional()
    .isBoolean()
    .withMessage('isVerified must be a boolean')
    .toBoolean(),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
    .toBoolean()
];

export const deleteAdminUserValidation = [
  param('id').isUUID().withMessage('User id must be a valid UUID')
];
