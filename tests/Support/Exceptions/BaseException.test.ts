import { test, expect, describe } from 'bun:test'
import { BaseException } from '../../../src/Support/Exceptions/BaseException'

class TestException extends BaseException {}

describe('BaseException', () => {
  test('should create basic exception', () => {
    const exception = new TestException('Test message')

    expect(exception).toBeInstanceOf(Error)
    expect(exception).toBeInstanceOf(BaseException)
    expect(exception.message).toBe('Test message')
    expect(exception.name).toBe('TestException')
  })

  test('should create exception with code', () => {
    const exception = new TestException('Test message', { code: 'TEST_ERROR' })

    expect(exception.code).toBe('TEST_ERROR')
  })

  test('should create exception with status code', () => {
    const exception = new TestException('Test message', { statusCode: 400 })

    expect(exception.statusCode).toBe(400)
  })

  test('should create exception with context', () => {
    const context = { userId: 123, action: 'test' }
    const exception = new TestException('Test message', { context })

    expect(exception.context).toEqual(context)
  })

  test('should create exception with cause', () => {
    const cause = new Error('Original error')
    const exception = new TestException('Test message', { cause })

    expect(exception.cause).toBe(cause)
  })

  test('should serialize to JSON', () => {
    const context = { userId: 123 }
    const exception = new TestException('Test message', {
      code: 'TEST_ERROR',
      statusCode: 400,
      context,
    })

    const json = exception.toJSON()

    expect(json).toMatchObject({
      name: 'TestException',
      message: 'Test message',
      code: 'TEST_ERROR',
      statusCode: 400,
      context,
    })
    expect(json.stack).toBeDefined()
  })

  test('should handle missing optional properties in JSON', () => {
    const exception = new TestException('Simple message')
    const json = exception.toJSON()

    expect(json).toMatchObject({
      name: 'TestException',
      message: 'Simple message',
      code: undefined,
      statusCode: undefined,
      context: undefined,
    })
  })
})
