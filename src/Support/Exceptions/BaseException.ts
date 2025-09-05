/**
 * Abstract base exception class that extends the standard Error class
 * Provides additional context and metadata for error handling
 */
export abstract class BaseException extends Error {
  public readonly code?: string | undefined
  public readonly statusCode?: number | undefined
  public readonly context?: Record<string, unknown> | undefined

  // Initialize base exception with message and optional metadata
  constructor(
    message: string,
    options: {
      code?: string
      statusCode?: number
      context?: Record<string, unknown>
      cause?: Error
    } = {}
  ) {
    super(message, { cause: options.cause })

    this.name = this.constructor.name
    this.code = options.code
    this.statusCode = options.statusCode
    this.context = options.context

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }

  // Serialize the exception to a JSON object for logging or API responses
  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      context: this.context,
      stack: this.stack,
    }
  }
}
