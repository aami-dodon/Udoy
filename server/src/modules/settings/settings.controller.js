import { validationResult } from 'express-validator';
import { listSettings, upsertSetting, deleteSetting } from './settings.service.js';
import { AuditLog } from './audit.model.js';

export const listSettingsHandler = async (req, res, next) => {
  try {
    const settings = await listSettings();
    return res.json({ data: settings });
  } catch (error) {
    return next(error);
  }
};

export const upsertSettingHandler = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const setting = await upsertSetting(req.body.key, req.body.value, req.body.description);
    await AuditLog.create({
      actorId: req.user.id,
      action: 'setting.upsert',
      target: setting.key,
      metadata: { value: setting.value },
    });
    return res.status(201).json(setting);
  } catch (error) {
    return next(error);
  }
};

export const deleteSettingHandler = async (req, res, next) => {
  try {
    await deleteSetting(req.params.key);
    await AuditLog.create({
      actorId: req.user.id,
      action: 'setting.delete',
      target: req.params.key,
    });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};
