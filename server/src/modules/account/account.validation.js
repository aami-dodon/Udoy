import { body } from 'express-validator';

const requireAtLeastOneField = body()
  .custom((value, { req }) => {
    const { name, email, newPassword, password } = req.body;
    if (!name && !email && !newPassword && !password) {
      throw new Error('No account changes supplied');
    }
    return true;
  })
  .withMessage('No account changes supplied');

const nameValidation = body('name')
  .optional({ checkFalsy: true })
  .isString()
  .withMessage('Name must be a string')
  .trim()
  .notEmpty()
  .withMessage('Name cannot be empty')
  .isLength({ max: 120 })
  .withMessage('Name must be 120 characters or fewer');

const emailValidation = body('email')
  .optional({ checkFalsy: true })
  .trim()
  .isEmail()
  .withMessage('Email must be valid')
  .normalizeEmail();

const newPasswordValidation = body('newPassword')
  .optional({ checkFalsy: true })
  .isLength({ min: 6, max: 128 })
  .withMessage('New password must be between 6 and 128 characters long');

const legacyPasswordValidation = body('password')
  .optional({ checkFalsy: true })
  .isLength({ min: 6, max: 128 })
  .withMessage('New password must be between 6 and 128 characters long')
  .custom((value, { req }) => {
    if (req.body.newPassword && req.body.newPassword !== value) {
      throw new Error('Provide only one new password value');
    }
    req.body.newPassword = value;
    return true;
  });

const currentPasswordValidation = body('currentPassword')
  .if((value, { req }) => Boolean(req.body.newPassword || req.body.password || req.body.email))
  .isString()
  .withMessage('Current password is required when updating email or password')
  .notEmpty()
  .withMessage('Current password is required when updating email or password')
  .isLength({ min: 6, max: 128 })
  .withMessage('Current password must be between 6 and 128 characters long');

export const updateAccountValidation = [
  requireAtLeastOneField,
  nameValidation,
  emailValidation,
  newPasswordValidation,
  legacyPasswordValidation,
  currentPasswordValidation
];
