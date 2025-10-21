let sendPasswordResetEmailImpl = async () => undefined;
let sendPasswordResetEmailCalls = [];

export function __setSendPasswordResetEmail(impl) {
  sendPasswordResetEmailImpl = impl;
}

export function __resetEmailServiceMocks() {
  sendPasswordResetEmailImpl = async () => undefined;
  sendPasswordResetEmailCalls = [];
}

export function __getSendPasswordResetEmailCalls() {
  return sendPasswordResetEmailCalls;
}

export async function sendPasswordResetEmail(...args) {
  sendPasswordResetEmailCalls.push(args);
  return sendPasswordResetEmailImpl(...args);
}

export async function sendVerificationEmail() {
  return null;
}

export async function sendEmail() {
  return null;
}

const emailService = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
};

export default emailService;
