class AppError extends Error {
  constructor(message, { status = 500, code, details, cause, expose } = {}) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    if (code) {
      this.code = code;
    }
    if (details) {
      this.details = details;
    }
    if (cause) {
      this.cause = cause;
    }
    this.expose = expose !== undefined ? expose : status < 500;
  }

  static from(error, defaultOptions = {}) {
    if (error instanceof AppError) {
      return error;
    }

    const derivedStatus = Number.isInteger(error.status)
      ? error.status
      : defaultOptions.status ?? 500;
    const derivedCode = error.code || defaultOptions.code;
    const derivedDetails = error.details || defaultOptions.details;
    const derivedExpose =
      error.expose !== undefined
        ? error.expose
        : defaultOptions.expose !== undefined
        ? defaultOptions.expose
        : derivedStatus < 500;

    return new AppError(error.message || 'Unexpected error', {
      status: derivedStatus,
      code: derivedCode,
      details: derivedDetails,
      cause: error,
      expose: derivedExpose,
    });
  }

  static badRequest(message, options = {}) {
    return new AppError(message, { status: 400, code: 'BAD_REQUEST', ...options });
  }

  static unauthorized(message, options = {}) {
    return new AppError(message, { status: 401, code: 'UNAUTHORIZED', ...options });
  }

  static forbidden(message, options = {}) {
    return new AppError(message, { status: 403, code: 'FORBIDDEN', ...options });
  }

  static notFound(message, options = {}) {
    return new AppError(message, { status: 404, code: 'NOT_FOUND', ...options });
  }

  static serviceUnavailable(message, options = {}) {
    return new AppError(message, { status: 503, code: 'SERVICE_UNAVAILABLE', ...options });
  }
}

export default AppError;
