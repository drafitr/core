import { test, expect, describe, beforeEach } from 'bun:test'
import { Kernel } from '../../src/Application/kernel'
import { Application } from '../../src/Application/Application'
import { ServiceProvider } from '../../src/Services/ServiceProvider'
import { Container } from '../../src/Support/Container'

describe('Kernel', () => {
  let kernel: Kernel

  beforeEach(() => {
    kernel = new Kernel()
  })

  test('should create kernel instance', () => {
    expect(kernel).toBeInstanceOf(Kernel)
    expect(kernel.getApplication()).toBeInstanceOf(Application)
  })

  test('should create kernel with service providers', () => {
    const provider = new (class extends ServiceProvider {
      register(): void {}
    })()

    const kernelWithProviders = new Kernel([provider])
    expect(kernelWithProviders.getApplication()).toBeInstanceOf(Application)
  })

  test('should register service provider', () => {
    const testToken = Symbol('test')
    const provider = new (class extends ServiceProvider {
      register(container: Container): void {
        container.bindValue(testToken, 'test-value')
      }
    })()

    const result = kernel.registerServiceProvider(provider)
    expect(result).toBe(kernel)
  })

  test('should start application with providers', async () => {
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

    kernel.registerServiceProvider(provider)
    const app = await kernel.start()

    expect(app).toBeInstanceOf(Application)
    expect(app.getContainer().resolve<string>(testToken)).toBe('test-value')
    expect(app.getContainer().resolve<boolean>(bootedToken)).toBe(true)
    expect(app.isRunning()).toBe(true)
  })

  test('should stop application', async () => {
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

    kernel.registerServiceProvider(provider)
    await kernel.start()
    await kernel.stop()

    expect(shutdownCalled).toBe(true)
    expect(kernel.getApplication().isRunning()).toBe(false)
  })
})
