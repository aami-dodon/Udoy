import { matchedData } from 'express-validator';

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

export const signupController = async (req, res, next) => {
  try {
    const payload = matchedData(req, { locations: ['body'] });
    const result = await signUp(payload);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const loginController = async (req, res, next) => {
  try {
    const credentials = matchedData(req, { locations: ['body'] });
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
    const { email } = matchedData(req, { locations: ['body'] });
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
    const { token, password } = matchedData(req, { locations: ['body'] });
    const user = await resetPasswordWithToken({ token, newPassword: password });
    res.json({ message: 'Password updated successfully.', user });
  } catch (error) {
    next(error);
  }
};

export const resendVerificationController = async (req, res, next) => {
  try {
    const { email } = matchedData(req, { locations: ['body'] });
    const response = await resendVerificationEmail(email);
    res.json(response);
  } catch (error) {
    next(error);
  }
};
