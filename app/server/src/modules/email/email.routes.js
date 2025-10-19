import { Router } from 'express';
import { sendTestEmail } from './email.controller.js';

const router = Router();

router.post('/email/test', sendTestEmail);

export default router;
