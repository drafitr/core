import { BaseException } from './BaseException'

/**
 * Base exception class for application-level errors
 * Provides default error codes and status codes for application failures
 */
export class ApplicationException extends BaseException {
  // Initialize application exception with default application error code and 500 status
  constructor(
    message: string,
    options: {
      code?: string
      statusCode?: number
      context?: Record<string, unknown>
      cause?: Error
    } = {}
  ) {
    super(message, {
      ...options,
      code: options.code ?? 'APPLICATION_ERROR',
      statusCode: options.statusCode ?? 500,
    })
  }
}

/**
 * Exception thrown when the application fails during bootstrap phase
 */
export class ApplicationBootstrapException extends ApplicationException {
  constructor(cause?: Error, context?: Record<string, unknown>) {
    super('Failed to bootstrap application', {
      code: 'APPLICATION_BOOTSTRAP_FAILED',
      ...(cause && { cause }),
      ...(context && { context }),
    })
  }
}

/**
 * Exception thrown when the application fails during boot phase
 */
export class ApplicationBootException extends ApplicationException {
  constructor(cause?: Error, context?: Record<string, unknown>) {
    super('Failed to boot application', {
      code: 'APPLICATION_BOOT_FAILED',
      ...(cause && { cause }),
      ...(context && { context }),
    })
  }
}

/**
 * Exception thrown when the application fails during shutdown
 */
export class ApplicationShutdownException extends ApplicationException {
  constructor(cause?: Error, context?: Record<string, unknown>) {
    super('Failed to shutdown application', {
      code: 'APPLICATION_SHUTDOWN_FAILED',
      ...(cause && { cause }),
      ...(context && { context }),
    })
  }
}
