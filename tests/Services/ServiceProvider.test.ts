import { test, expect, describe } from 'bun:test'
import { ServiceProvider } from '../../src/Services/ServiceProvider'
import { Container } from '../../src/Support/Container'

describe('ServiceProvider', () => {
  test('should be abstract and require register implementation', () => {
    const testToken = Symbol('test')
    const provider = new (class extends ServiceProvider {
      register(container: Container): void {
        container.bindValue(testToken, 'test-value')
      }
    })()

    expect(provider).toBeInstanceOf(ServiceProvider)

    const container = new Container()
    provider.register(container)

    expect(container.resolve<string>(testToken)).toBe('test-value')
  })

  test('should have optional boot method', () => {
    const bootedToken = Symbol('booted')
    const provider = new (class extends ServiceProvider {
      register(): void {}

      boot(container: Container): void {
        container.bindValue(bootedToken, true)
      }
    })()

    expect(typeof provider.boot).toBe('function')

    const container = new Container()
    provider.boot?.(container)

    expect(container.resolve<boolean>(bootedToken)).toBe(true)
  })

  test('should have optional shutdown method', () => {
    let shutdownCalled = false

    const provider = new (class extends ServiceProvider {
      register(): void {}

      shutdown(): void {
        shutdownCalled = true
      }
    })()

    expect(typeof provider.shutdown).toBe('function')

    provider.shutdown?.()

    expect(shutdownCalled).toBe(true)
  })

  test('should work without optional methods', () => {
    const testToken = Symbol('test')
    const provider = new (class extends ServiceProvider {
      register(container: Container): void {
        container.bindValue(testToken, 'minimal-provider')
      }
    })()

    expect(provider.boot).toBeUndefined()
    expect(provider.shutdown).toBeUndefined()

    const container = new Container()
    provider.register(container)

    expect(container.resolve<string>(testToken)).toBe('minimal-provider')
  })
})
