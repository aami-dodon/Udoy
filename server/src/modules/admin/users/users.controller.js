import { matchedData } from 'express-validator';
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
    const data = matchedData(req, { locations: ['params', 'body'], includeOptionals: true });
    const { id, name, role, isVerified, isActive } = data;

    const updates = {};

    if (typeof name !== 'undefined') {
      updates.name = name;
    }

    if (typeof role !== 'undefined') {
      updates.role = role;
    }

    if (typeof isVerified !== 'undefined') {
      updates.isVerified = isVerified;
    }

    if (typeof isActive !== 'undefined') {
      updates.isActive = isActive;
    }

    const updated = await updateUserByAdmin(id, updates, {
      actorId: req.user?.id
    });
    res.json({ user: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteUserController = async (req, res, next) => {
  try {
    const { id } = matchedData(req, { locations: ['params'] });
    const user = await deleteUserByAdmin(id, {
      actorId: req.user?.id
    });
    res.json({ user, message: 'User account deleted.' });
  } catch (error) {
    next(error);
  }
};
