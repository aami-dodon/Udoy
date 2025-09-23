import { Router } from 'express';
import { body } from 'express-validator';
import { requireAuth, requireRoles } from '../../middlewares/auth.js';
import {
  listSettingsHandler,
  upsertSettingHandler,
  deleteSettingHandler,
} from './settings.controller.js';

export const settingsRouter = Router();

settingsRouter.use(requireAuth);
settingsRouter.use(requireRoles('admin'));

settingsRouter.get('/', listSettingsHandler);
settingsRouter.post(
  '/',
  [body('key').isString(), body('value').isString(), body('description').optional().isString()],
  upsertSettingHandler
);
settingsRouter.delete('/:key', deleteSettingHandler);
