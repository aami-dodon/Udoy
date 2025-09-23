import { validationResult } from 'express-validator';
import { listUsers, getUserById, updateUser, deleteUser } from './users.service.js';

export const listUsersHandler = async (req, res, next) => {
  try {
    const users = await listUsers();
    return res.json({ data: users });
  } catch (error) {
    return next(error);
  }
};

export const getUserHandler = async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json(user);
  } catch (error) {
    return next(error);
  }
};

export const updateUserHandler = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const updated = await updateUser(req.params.id, req.body);
    return res.json(updated);
  } catch (error) {
    return next(error);
  }
};

export const deleteUserHandler = async (req, res, next) => {
  try {
    await deleteUser(req.params.id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};
