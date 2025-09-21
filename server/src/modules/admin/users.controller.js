import { ApplicationError } from '../../utils/errors.js';
import {
  deleteUserByAdmin,
  listAllUsers,
  updateUserByAdmin
} from './users.service.js';

export const listUsersController = async (req, res, next) => {
  try {
    const users = await listAllUsers();
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

export const updateUserController = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new ApplicationError('User id is required', 400);
    }
    const updated = await updateUserByAdmin(id, req.body || {});
    res.json({ user: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteUserController = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new ApplicationError('User id is required', 400);
    }
    const user = await deleteUserByAdmin(id);
    res.json({ user, message: 'User account deleted.' });
  } catch (error) {
    next(error);
  }
};
