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

  test('should boot providers in dependency order', async () => {
    const bootOrder: string[] = []

    // Database provider - no dependencies
    const databaseProvider = new (class extends ServiceProvider {
      getProviderName(): string { return 'DatabaseProvider' }
      getDependencies(): string[] { return [] }
      register(): void {}
      boot(): void {
        bootOrder.push('Database')
      }
    })()

    // Cache provider - depends on Database
    const cacheProvider = new (class extends ServiceProvider {
      getProviderName(): string { return 'CacheProvider' }
      getDependencies(): string[] { return ['DatabaseProvider'] }
      register(): void {}
      boot(): void {
        bootOrder.push('Cache')
      }
    })()

    // Web provider - depends on both Database and Cache
    const webProvider = new (class extends ServiceProvider {
      getProviderName(): string { return 'WebProvider' }
      getDependencies(): string[] { return ['DatabaseProvider', 'CacheProvider'] }
      register(): void {}
      boot(): void {
        bootOrder.push('Web')
      }
    })()

    serviceManager.register(webProvider) // Register in reverse order to test sorting
    serviceManager.register(cacheProvider)
    serviceManager.register(databaseProvider)
    
    await serviceManager.registerAll()
    await serviceManager.bootAll()

    expect(bootOrder).toEqual(['Database', 'Cache', 'Web'])
  })

  test('should shutdown providers in reverse dependency order', async () => {
    const shutdownOrder: string[] = []

    // Database provider - no dependencies
    const databaseProvider = new (class extends ServiceProvider {
      getProviderName(): string { return 'DatabaseProvider' }
      getDependencies(): string[] { return [] }
      register(): void {}
      boot(): void {}
      shutdown(): void {
        shutdownOrder.push('Database')
      }
    })()

    // Cache provider - depends on Database
    const cacheProvider = new (class extends ServiceProvider {
      getProviderName(): string { return 'CacheProvider' }
      getDependencies(): string[] { return ['DatabaseProvider'] }
      register(): void {}
      boot(): void {}
      shutdown(): void {
        shutdownOrder.push('Cache')
      }
    })()

    // Web provider - depends on both Database and Cache
    const webProvider = new (class extends ServiceProvider {
      getProviderName(): string { return 'WebProvider' }
      getDependencies(): string[] { return ['DatabaseProvider', 'CacheProvider'] }
      register(): void {}
      boot(): void {}
      shutdown(): void {
        shutdownOrder.push('Web')
      }
    })()

    serviceManager.register(databaseProvider)
    serviceManager.register(cacheProvider)
    serviceManager.register(webProvider)
    
    await serviceManager.registerAll()
    await serviceManager.bootAll()
    await serviceManager.shutdownAll()

    expect(shutdownOrder).toEqual(['Web', 'Cache', 'Database'])
  })

  test('should handle providers without dependencies', async () => {
    const bootOrder: string[] = []

    const provider1 = new (class extends ServiceProvider {
      register(): void {}
      boot(): void {
        bootOrder.push('Provider1')
      }
    })()

    const provider2 = new (class extends ServiceProvider {
      register(): void {}
      boot(): void {
        bootOrder.push('Provider2')
      }
    })()

    serviceManager.register(provider1)
    serviceManager.register(provider2)
    await serviceManager.registerAll()
    await serviceManager.bootAll()

    // Order should be preserved when no dependencies exist
    expect(bootOrder).toEqual(['Provider1', 'Provider2'])
  })

  test('should throw error for missing dependencies', async () => {
    const provider = new (class extends ServiceProvider {
      getProviderName(): string { return 'TestProvider' }
      getDependencies(): string[] { return ['NonExistentProvider'] }
      register(): void {}
      boot(): void {}
    })()

    serviceManager.register(provider)
    await serviceManager.registerAll()

    await expect(serviceManager.bootAll()).rejects.toThrow(
      "Service provider 'TestProvider' depends on 'NonExistentProvider', but 'NonExistentProvider' is not registered"
    )
  })

  test('should throw error for circular dependencies', async () => {
    const providerA = new (class extends ServiceProvider {
      getProviderName(): string { return 'ProviderA' }
      getDependencies(): string[] { return ['ProviderB'] }
      register(): void {}
      boot(): void {}
    })()

    const providerB = new (class extends ServiceProvider {
      getProviderName(): string { return 'ProviderB' }
      getDependencies(): string[] { return ['ProviderA'] }
      register(): void {}
      boot(): void {}
    })()

    serviceManager.register(providerA)
    serviceManager.register(providerB)
    await serviceManager.registerAll()

    await expect(serviceManager.bootAll()).rejects.toThrow(
      'Circular dependency detected among service providers: ProviderA, ProviderB'
    )
  })

  test('should use constructor name when provider name is not specified', async () => {
    const bootOrder: string[] = []

    class DatabaseService extends ServiceProvider {
      register(): void {}
      boot(): void {
        bootOrder.push('DatabaseService')
      }
    }

    class WebService extends ServiceProvider {
      getDependencies(): string[] { return ['DatabaseService'] }
      register(): void {}
      boot(): void {
        bootOrder.push('WebService')
      }
    }

    serviceManager.register(new WebService())
    serviceManager.register(new DatabaseService())
    await serviceManager.registerAll()
    await serviceManager.bootAll()

    expect(bootOrder).toEqual(['DatabaseService', 'WebService'])
  })
})
