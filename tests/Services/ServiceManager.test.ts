import { test, expect, describe, beforeEach } from 'bun:test'
import { ServiceManager } from '../../src/Services/ServiceManager'
import { ServiceProvider } from '../../src/Services/ServiceProvider'
import { Container } from '../../src/Support/Container'

describe('ServiceManager', () => {
  let container: Container
  let serviceManager: ServiceManager

  beforeEach(() => {
    container = new Container()
    serviceManager = new ServiceManager(container)
  })

  test('should create service manager instance', () => {
    expect(serviceManager).toBeInstanceOf(ServiceManager)
  })

  test('should register service provider', () => {
    const provider = new (class extends ServiceProvider {
      register(): void {}
    })()

    serviceManager.register(provider)
    expect(serviceManager.getRegisteredProviders()).toHaveLength(0) // Not registered until registerAll()
  })

  test('should register all providers', async () => {
    let registerCalled = false
    const testToken = Symbol('test')
    const provider = new (class extends ServiceProvider {
      register(container: Container): void {
        registerCalled = true
        container.bindValue(testToken, 'test-value')
      }
    })()

    serviceManager.register(provider)
    await serviceManager.registerAll()

    expect(registerCalled).toBe(true)
    expect(serviceManager.getRegisteredProviders()).toHaveLength(1)
    expect(container.resolve<string>(testToken)).toBe('test-value')
  })

  test('should boot all providers', async () => {
    let bootCalled = false
    const testToken = Symbol('test')
    const bootedToken = Symbol('booted')
    const provider = new (class extends ServiceProvider {
      register(container: Container): void {
        container.bindValue(testToken, 'test-value')
      }

      boot(container: Container): void {
        bootCalled = true
        container.bindValue(bootedToken, true)
      }
    })()

    serviceManager.register(provider)
    await serviceManager.registerAll()
    await serviceManager.bootAll()

    expect(bootCalled).toBe(true)
    expect(serviceManager.getBootedProviders()).toHaveLength(1)
    expect(container.resolve<boolean>(bootedToken)).toBe(true)
  })

  test('should handle providers without boot method', async () => {
    const testToken = Symbol('test')
    const provider = new (class extends ServiceProvider {
      register(container: Container): void {
        container.bindValue(testToken, 'test-value')
      }
    })()

    serviceManager.register(provider)
    await serviceManager.registerAll()
    await serviceManager.bootAll()

    expect(serviceManager.getRegisteredProviders()).toHaveLength(1)
    expect(serviceManager.getBootedProviders()).toHaveLength(0)
  })

  test('should shutdown all providers in reverse order', async () => {
    const shutdownOrder: number[] = []

    const provider1 = new (class extends ServiceProvider {
      register(): void {}
      boot(): void {}
      shutdown(): void {
        shutdownOrder.push(1)
      }
    })()

    const provider2 = new (class extends ServiceProvider {
      register(): void {}
      boot(): void {}
      shutdown(): void {
        shutdownOrder.push(2)
      }
    })()

    serviceManager.register(provider1)
    serviceManager.register(provider2)
    await serviceManager.registerAll()
    await serviceManager.bootAll()
    await serviceManager.shutdownAll()

    expect(shutdownOrder).toEqual([2, 1]) // Reverse order
    expect(serviceManager.getRegisteredProviders()).toHaveLength(0)
    expect(serviceManager.getBootedProviders()).toHaveLength(0)
  })

  test('should handle providers without shutdown method', async () => {
    const provider = new (class extends ServiceProvider {
      register(): void {}
      boot(): void {}
    })()

    serviceManager.register(provider)
    await serviceManager.registerAll()
    await serviceManager.bootAll()

    await expect(serviceManager.shutdownAll()).resolves.toBeUndefined()
    expect(serviceManager.getRegisteredProviders()).toHaveLength(0)
    expect(serviceManager.getBootedProviders()).toHaveLength(0)
  })
})
