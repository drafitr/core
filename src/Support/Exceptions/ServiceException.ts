import { BaseException } from './BaseException'

/**
 * Base exception class for service-related errors
 * Provides default error codes and status codes for service failures
 */
export class ServiceException extends BaseException {
  // Initialize service exception with default service error code and 500 status
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
      code: options.code ?? 'SERVICE_ERROR',
      statusCode: options.statusCode ?? 500,
    })
  }
}

/**
 * Exception thrown when a service fails to register properly
 */
export class ServiceRegistrationException extends ServiceException {
  constructor(serviceName: string, cause?: Error, context?: Record<string, unknown>) {
    super(`Failed to register service: ${serviceName}`, {
      code: 'SERVICE_REGISTRATION_FAILED',
      ...(cause && { cause }),
      context: { serviceName, ...context },
    })
  }
}

/**
 * Exception thrown when a service fails during the boot phase
 */
export class ServiceBootException extends ServiceException {
  constructor(serviceName: string, cause?: Error, context?: Record<string, unknown>) {
    super(`Failed to boot service: ${serviceName}`, {
      code: 'SERVICE_BOOT_FAILED',
      ...(cause && { cause }),
      context: { serviceName, ...context },
    })
  }
}

/**
 * Exception thrown when a service fails during shutdown
 */
export class ServiceShutdownException extends ServiceException {
  constructor(serviceName: string, cause?: Error, context?: Record<string, unknown>) {
    super(`Failed to shutdown service: ${serviceName}`, {
      code: 'SERVICE_SHUTDOWN_FAILED',
      ...(cause && { cause }),
      context: { serviceName, ...context },
    })
  }
}
