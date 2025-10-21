let getUserByEmailImpl = async () => null;
let getUserByEmailCalls = [];

export function __setGetUserByEmail(impl) {
  getUserByEmailImpl = impl;
}

export function __resetUserServiceMocks() {
  getUserByEmailImpl = async () => null;
  getUserByEmailCalls = [];
}

export function __getUserByEmailCalls() {
  return getUserByEmailCalls;
}

export async function getUserByEmail(...args) {
  getUserByEmailCalls.push(args);
  return getUserByEmailImpl(...args);
}

export async function getUserAuthPayload() {
  return null;
}

export async function createUser() {
  return null;
}

export async function ensureGuardianForStudent() {
  return null;
}

export function isMinor() {
  return false;
}

export function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : email;
}

export function toUserProfile(user) {
  return user;
}
