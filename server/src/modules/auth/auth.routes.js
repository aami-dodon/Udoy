import { Router } from 'express';

import { authenticate } from '../../middlewares/auth.js';
import {
  forgotPasswordController,
  loginController,
  meController,
  resetPasswordController,
  resendVerificationController,
  signupController,
  verifyEmailController
} from './auth.controller.js';

const router = Router();

router.post('/signup', signupController);
router.post('/login', loginController);
router.get('/verify/:token', verifyEmailController);
router.post('/forgot-password', forgotPasswordController);
router.post('/reset-password', resetPasswordController);
router.post('/resend-verification', resendVerificationController);
router.get('/me', authenticate, meController);

export const authRoutes = router;
