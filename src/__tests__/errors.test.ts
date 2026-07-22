import { describe, it, expect } from 'vitest'
import {
  VerbatimsError,
  NotFoundError,
  RateLimitError,
  ValidationError,
  AuthError,
  ForbiddenError,
} from '../errors'

describe('VerbatimsError', () => {
  it('creates error with message, status code, and optional code', () => {
    const err = new VerbatimsError('Something went wrong', 500, 'INTERNAL')
    expect(err).toBeInstanceOf(Error)
    expect(err.message).toBe('Something went wrong')
    expect(err.statusCode).toBe(500)
    expect(err.code).toBe('INTERNAL')
    expect(err.name).toBe('VerbatimsError')
  })
})

describe('NotFoundError', () => {
  it('creates 404 error with default message', () => {
    const err = new NotFoundError()
    expect(err).toBeInstanceOf(VerbatimsError)
    expect(err.statusCode).toBe(404)
    expect(err.code).toBe('NOT_FOUND')
    expect(err.message).toBe('Resource not found')
    expect(err.name).toBe('NotFoundError')
  })

  it('creates 404 error with custom message', () => {
    const err = new NotFoundError('Quote not found')
    expect(err.message).toBe('Quote not found')
  })
})

describe('RateLimitError', () => {
  it('creates 429 error with rate limit metadata', () => {
    const err = new RateLimitError('Too many requests', 30, 100, 0, 12345)
    expect(err.statusCode).toBe(429)
    expect(err.retryAfter).toBe(30)
    expect(err.limit).toBe(100)
    expect(err.remaining).toBe(0)
    expect(err.reset).toBe(12345)
    expect(err.code).toBe('RATE_LIMITED')
    expect(err.name).toBe('RateLimitError')
  })
})

describe('ValidationError', () => {
  it('creates 400 error with errors array', () => {
    const err = new ValidationError('Invalid data', ['name is required', 'email is invalid'])
    expect(err.statusCode).toBe(400)
    expect(err.errors).toEqual(['name is required', 'email is invalid'])
    expect(err.code).toBe('VALIDATION_ERROR')
    expect(err.name).toBe('ValidationError')
  })

  it('creates 400 error without errors array', () => {
    const err = new ValidationError('Invalid data')
    expect(err.statusCode).toBe(400)
    expect(err.errors).toBeUndefined()
  })
})

describe('AuthError', () => {
  it('creates 401 error with default message', () => {
    const err = new AuthError()
    expect(err.statusCode).toBe(401)
    expect(err.code).toBe('AUTH_ERROR')
    expect(err.message).toBe('Authentication required')
    expect(err.name).toBe('AuthError')
  })
})

describe('ForbiddenError', () => {
  it('creates 403 error with default message', () => {
    const err = new ForbiddenError()
    expect(err.statusCode).toBe(403)
    expect(err.code).toBe('FORBIDDEN')
    expect(err.message).toBe('Access denied')
    expect(err.name).toBe('ForbiddenError')
  })
})
