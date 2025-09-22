import { body } from 'express-validator';

import { ROLES } from '../../../../shared/constants/index.js';

const signupPasswordValidator = body('password')
  .isString()
  .withMessage('Password is required')
  .isLength({ min: 6, max: 128 })
  .withMessage('Password must be between 6 and 128 characters long');

export const signupValidation = [
  body('name')
    .isString()
    .withMessage('Name is required')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 120 })
    .withMessage('Name must be 120 characters or fewer'),
  body('email')
    .isString()
    .withMessage('Email is required')
    .trim()
    .isEmail()
    .withMessage('Email must be valid')
    .normalizeEmail(),
  signupPasswordValidator,
  body('role')
    .isString()
    .withMessage('Role is required')
    .isIn([ROLES.STUDENT, ROLES.TEACHER])
    .withMessage('Role must be student or teacher')
];

export const loginValidation = [
  body('email')
    .isString()
    .withMessage('Email is required')
    .trim()
    .isEmail()
    .withMessage('Email must be valid')
    .normalizeEmail(),
  body('password')
    .isString()
    .withMessage('Password is required')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ max: 128 })
    .withMessage('Password must be 128 characters or fewer')
];

export const emailOnlyValidation = [
  body('email')
    .isString()
    .withMessage('Email is required')
    .trim()
    .isEmail()
    .withMessage('Email must be valid')
    .normalizeEmail()
];

export const resetPasswordValidation = [
  body('token').isString().withMessage('Token is required').trim().notEmpty().withMessage('Token is required'),
  body('password')
    .isString()
    .withMessage('Password is required')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters long')
];
