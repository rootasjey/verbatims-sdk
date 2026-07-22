export class VerbatimsError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
  ) {
    super(message)
    this.name = 'VerbatimsError'
  }
}

export class NotFoundError extends VerbatimsError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class RateLimitError extends VerbatimsError {
  constructor(
    message: string,
    public retryAfter: number,
    public limit: number,
    public remaining: number,
    public reset: number,
  ) {
    super(message, 429, 'RATE_LIMITED')
    this.name = 'RateLimitError'
  }
}

export class ValidationError extends VerbatimsError {
  constructor(
    message: string,
    public errors?: string[],
  ) {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

export class AuthError extends VerbatimsError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTH_ERROR')
    this.name = 'AuthError'
  }
}

export class ForbiddenError extends VerbatimsError {
  constructor(message = 'Access denied') {
    super(message, 403, 'FORBIDDEN')
    this.name = 'ForbiddenError'
  }
}
