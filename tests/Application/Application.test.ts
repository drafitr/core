import { test, expect, describe, beforeEach } from 'bun:test'
import { Application } from '../../src/Application/Application'
import { ServiceProvider } from '../../src/Services/ServiceProvider'
import { Container } from '../../src/Support/Container'

describe('Application', () => {
  let app: Application

  beforeEach(() => {
    app = new Application()
  })

  test('should create application instance', () => {
    expect(app).toBeInstanceOf(Application)
    expect(app.getContainer()).toBeInstanceOf(Container)
    expect(app.getServiceManager()).toBeDefined()
  })

  test('should register service provider', () => {
    const testToken = Symbol('test')
    const provider = new (class extends ServiceProvider {
      register(container: Container): void {
        container.bindValue(testToken, 'test-value')
      }
    })()

    const result = app.register(provider)
    expect(result).toBe(app)
  })

  test('should bootstrap application', async () => {
    const testToken = Symbol('test')
    const provider = new (class extends ServiceProvider {
      register(container: Container): void {
        container.bindValue(testToken, 'test-value')
      }
    })()

    app.register(provider)
    await app.bootstrap()

    expect(app.getContainer().resolve<string>(testToken)).toBe('test-value')
  })

  test('should throw error if bootstrapped twice', async () => {
    await app.bootstrap()

    await expect(app.bootstrap()).rejects.toThrow('Application is already bootstrapped')
  })

  test('should boot application after bootstrap', async () => {
    const testToken = Symbol('test')
    const bootedToken = Symbol('booted')
    const provider = new (class extends ServiceProvider {
      register(container: Container): void {
        container.bindValue(testToken, 'test-value')
      }

      boot(container: Container): void {
        container.bindValue(bootedToken, true)
      }
    })()

    app.register(provider)
    await app.bootstrap()
    await app.boot()

    expect(app.getContainer().resolve<boolean>(bootedToken)).toBe(true)
    expect(app.isRunning()).toBe(true)
  })

  test('should throw error if booted before bootstrap', async () => {
    await expect(app.boot()).rejects.toThrow('Application must be bootstrapped before booting')
  })

  test('should throw error if booted twice', async () => {
    await app.bootstrap()
    await app.boot()

    await expect(app.boot()).rejects.toThrow('Application is already booted')
  })

  test('should run application (bootstrap + boot)', async () => {
    const testToken = Symbol('test')
    const bootedToken = Symbol('booted')
    const provider = new (class extends ServiceProvider {
      register(container: Container): void {
        container.bindValue(testToken, 'test-value')
      }

      boot(container: Container): void {
        container.bindValue(bootedToken, true)
      }
    })()

    app.register(provider)
    await app.run()

    expect(app.getContainer().resolve<string>(testToken)).toBe('test-value')
    expect(app.getContainer().resolve<boolean>(bootedToken)).toBe(true)
    expect(app.isRunning()).toBe(true)
  })

  test('should shutdown application', async () => {
    let shutdownCalled = false
    const testToken = Symbol('test')
    const provider = new (class extends ServiceProvider {
      register(container: Container): void {
        container.bindValue(testToken, 'test-value')
      }

      shutdown(): void {
        shutdownCalled = true
      }
    })()

    app.register(provider)
    await app.run()
    await app.shutdown()

    expect(shutdownCalled).toBe(true)
    expect(app.isRunning()).toBe(false)
  })

  test('should not throw when shutting down non-booted application', async () => {
    await expect(app.shutdown()).resolves.toBeUndefined()
  })
})
