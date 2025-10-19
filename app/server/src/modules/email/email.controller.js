import crypto from 'crypto';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../../services/emailService.js';

export async function sendTestEmail(req, res, next) {
  try {
    const {
      to,
      type = 'verification',
      name = 'Udoy Tester',
      template,
      textTemplate,
      variables = {},
    } = req.body || {};

    const normalizedType =
      typeof type === 'string' && type.trim()
        ? type.trim().toLowerCase()
        : 'verification';
    const emailType = normalizedType === 'passwordreset' ? 'passwordReset' : 'verification';

    const safeName = typeof name === 'string' && name.trim() ? name.trim() : 'Udoy Tester';
    const safeVariables =
      variables && typeof variables === 'object' && !Array.isArray(variables)
        ? variables
        : {};

    if (!to) {
      return res.status(400).json({
        status: 'error',
        message: 'Recipient email address (to) is required.',
      });
    }

    const token = crypto.randomBytes(20).toString('hex');
    const commonPayload = {
      to,
      token,
      template,
      textTemplate,
      variables: { name: safeName, ...safeVariables },
    };

    if (emailType === 'passwordReset') {
      await sendPasswordResetEmail(commonPayload);
    } else {
      await sendVerificationEmail(commonPayload);
    }

    return res.status(200).json({
      status: 'success',
      message: `Test ${emailType} email sent to ${to}.`,
    });
  } catch (error) {
    return next(error);
  }
}
