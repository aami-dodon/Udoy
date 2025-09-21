import { ApplicationError } from '../../utils/errors.js';
import {
  signUp,
  login,
  getUserProfile,
  verifyEmailToken,
  requestPasswordReset,
  resetPasswordWithToken,
  getSupportEmail,
  resendVerificationEmail
} from './auth.service.js';

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
    const result = await signUp(payload);
    res.status(201).json(result);
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

export const verifyEmailController = async (req, res, next) => {
  try {
    const { token } = req.params;
    const user = await verifyEmailToken(token);
    res.json({ user, message: 'Email verified successfully.' });
  } catch (error) {
    next(error);
  }
};

export const forgotPasswordController = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new ApplicationError('Email is required', 400);
    }
    await requestPasswordReset(email);
    res.json({
      message: 'If the account exists, a password reset email has been sent.',
      supportEmail: getSupportEmail()
    });
  } catch (error) {
    next(error);
  }
};

export const resetPasswordController = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      throw new ApplicationError('Token and new password are required', 400);
    }
    const user = await resetPasswordWithToken({ token, newPassword: password });
    res.json({ message: 'Password updated successfully.', user });
  } catch (error) {
    next(error);
  }
};

export const resendVerificationController = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new ApplicationError('Email is required', 400);
    }
    const response = await resendVerificationEmail(email);
    res.json(response);
  } catch (error) {
    next(error);
  }
};
