export class ApplicationError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = 'ApplicationError';
    this.status = status;
  }
}

export const isApplicationError = (error) => error instanceof ApplicationError;
