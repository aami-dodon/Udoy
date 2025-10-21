let generateVerificationTokenImpl = async () => ({ token: 'stub-token' });
let generateVerificationTokenCalls = [];

export function __setGenerateVerificationToken(impl) {
  generateVerificationTokenImpl = impl;
}

export function __resetTokenServiceMocks() {
  generateVerificationTokenImpl = async () => ({ token: 'stub-token' });
  generateVerificationTokenCalls = [];
}

export function __getGenerateVerificationTokenCalls() {
  return generateVerificationTokenCalls;
}

export async function generateVerificationToken(...args) {
  generateVerificationTokenCalls.push(args);
  return generateVerificationTokenImpl(...args);
}

export async function consumeVerificationToken() {
  return null;
}

export async function issueSessionTokens() {
  return { accessToken: 'stub', refreshToken: 'stub' };
}

export async function rotateSessionTokens() {
  return null;
}

export async function revokeSession() {
  return null;
}
