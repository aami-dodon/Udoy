import { Router } from 'express';
import { body } from 'express-validator';
import { login, register } from './controller.js';

const router = Router();

router.post(
  '/register',
  [
    body('name').isString().isLength({ min: 2 }),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('role').isIn(['student', 'teacher'])
  ],
  register
);

router.post('/login', [body('email').isEmail(), body('password').isLength({ min: 6 })], login);

export default router;
