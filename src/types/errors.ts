/**
 * Error types for the SDK
 */

/**
 * Base error class for all WhatsApp SDK errors
 */
export class WhatsAppError extends Error {
  public readonly code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'WhatsAppError';
    this.code = code;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, WhatsAppError);
    }
  }
}

/**
 * API error from WhatsApp Cloud API
 */
export class APIError extends WhatsAppError {
  public readonly statusCode: number;
  public readonly errorCode: number;
  public readonly errorSubcode?: number;
  public readonly fbtraceId?: string;

  constructor(
    message: string,
    statusCode: number,
    errorCode: number,
    errorSubcode?: number,
    fbtraceId?: string
  ) {
    super(message, `API_ERROR_${errorCode}`);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errorSubcode = errorSubcode;
    this.fbtraceId = fbtraceId;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, APIError);
    }
  }
}

/**
 * Validation error for invalid input
 */
export class ValidationError extends WhatsAppError {
  public readonly field?: string;
  public readonly zodError?: unknown;

  constructor(message: string, field?: string, zodError?: unknown) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    this.field = field;
    this.zodError = zodError;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
}

/**
 * Network error for connection issues
 */
export class NetworkError extends WhatsAppError {
  public readonly cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
    this.cause = cause;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NetworkError);
    }
  }
}

/**
 * Rate limit error when API rate limits are exceeded
 */
export class RateLimitError extends APIError {
  public readonly retryAfter?: number;

  constructor(message: string, retryAfter?: number) {
    super(message, 429, 4, undefined, undefined);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RateLimitError);
    }
  }
}
