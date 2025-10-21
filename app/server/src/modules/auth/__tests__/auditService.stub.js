let logAuditEventImpl = async () => undefined;
let logAuditEventCalls = [];

export function __setLogAuditEvent(impl) {
  logAuditEventImpl = impl;
}

export function __resetAuditServiceMocks() {
  logAuditEventImpl = async () => undefined;
  logAuditEventCalls = [];
}

export function __getLogAuditEventCalls() {
  return logAuditEventCalls;
}

export async function logAuditEvent(...args) {
  logAuditEventCalls.push(args);
  return logAuditEventImpl(...args);
}

export default {
  logAuditEvent,
};
