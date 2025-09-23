import { Router } from 'express';
import { authRouter } from '../modules/auth/auth.routes.js';
import { userRouter } from '../modules/users/users.routes.js';
import { academicRouter } from '../modules/academics/academics.routes.js';
import { settingsRouter } from '../modules/settings/settings.routes.js';

export const routes = Router();

routes.use('/auth', authRouter);
routes.use('/users', userRouter);
routes.use('/academics', academicRouter);
routes.use('/settings', settingsRouter);

routes.get('/health', (req, res) => res.json({ status: 'ok' }));
