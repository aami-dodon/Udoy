export class ApplicationError extends Error {
  constructor(message, status = 500, options = {}) {
    super(message);
    this.name = 'ApplicationError';
    this.status = status;

    if (options.code) {
      this.code = options.code;
    }

    if (options.details) {
      this.details = options.details;
    }
  }
}

export const isApplicationError = (error) => error instanceof ApplicationError;
