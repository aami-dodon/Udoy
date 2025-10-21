const overrides = new Map([
  ['@prisma/client', './prismaClient.stub.js'],
  ['../../services/userService.js', './userService.stub.js'],
  ['../../../services/userService.js', './userService.stub.js'],
  ['../../services/tokenService.js', './tokenService.stub.js'],
  ['../../../services/tokenService.js', './tokenService.stub.js'],
  ['../../services/emailService.js', './emailService.stub.js'],
  ['../../../services/emailService.js', './emailService.stub.js'],
  ['../../services/auditService.js', './auditService.stub.js'],
  ['../../../services/auditService.js', './auditService.stub.js'],
]);

export async function resolve(specifier, context, defaultResolve) {
  if (overrides.has(specifier)) {
    return {
      shortCircuit: true,
      url: new URL(overrides.get(specifier), import.meta.url).href,
    };
  }

  return defaultResolve(specifier, context, defaultResolve);
}
