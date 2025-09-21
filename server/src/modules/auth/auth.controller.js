import { ApplicationError } from '../../utils/errors.js';
import { signUp, login, getUserProfile } from './auth.service.js';

const validateSignupInput = (body) => {
  const { name, email, password, role } = body;
  if (!name || !email || !password || !role) {
    throw new ApplicationError('Missing required fields', 400);
  }

  if (password.length < 6) {
    throw new ApplicationError('Password must be at least 6 characters long', 400);
  }

  return { name: name.trim(), email, password, role };
};

const validateLoginInput = (body) => {
  const { email, password } = body;
  if (!email || !password) {
    throw new ApplicationError('Email and password are required', 400);
  }
  return { email, password };
};

export const signupController = async (req, res, next) => {
  try {
    const payload = validateSignupInput(req.body);
    const { user, token } = await signUp(payload);
    res.status(201).json({ token, user });
  } catch (error) {
    next(error);
  }
};

export const loginController = async (req, res, next) => {
  try {
    const credentials = validateLoginInput(req.body);
    const { user, token } = await login(credentials);
    res.json({ token, user });
  } catch (error) {
    next(error);
  }
};

export const meController = async (req, res, next) => {
  try {
    const user = await getUserProfile(req.user.id);
    res.json({ user });
  } catch (error) {
    next(error);
  }
};
