import { ApplicationError } from '../../utils/errors.js';
import { updateProfile } from './user.service.js';

export const updateProfileController = async (req, res, next) => {
  try {
    const { name, email, currentPassword, newPassword, password } = req.body;

    if (!name && !email && !newPassword && !password) {
      throw new ApplicationError('No profile changes supplied', 400);
    }

    const result = await updateProfile(req.user.id, {
      name,
      email,
      currentPassword,
      newPassword: newPassword || password
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};
