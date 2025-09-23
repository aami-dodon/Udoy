import { matchedData } from 'express-validator';

import { updateAccountDetails } from './account.service.js';

export const updateAccountController = async (req, res, next) => {
  try {
    const data = matchedData(req, { locations: ['body'], includeOptionals: true });
    const payload = {
      name: data.name,
      email: data.email,
      currentPassword: data.currentPassword,
      newPassword: data.newPassword || data.password
    };

    const result = await updateAccountDetails(req.user.id, payload);

    res.json(result);
  } catch (error) {
    next(error);
  }
};
