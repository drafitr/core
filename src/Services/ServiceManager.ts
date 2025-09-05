import { Container } from '../Support/Container'
import { ServiceProviderInterface } from '../Contracts/ServiceProviderInterface'

/**
 * Service manager that handles registration, booting, and shutdown of service providers
 * Manages the lifecycle of all services in the application
 */
export class ServiceManager {
  private container: Container
  private providers: ServiceProviderInterface[] = []
  private registeredProviders: ServiceProviderInterface[] = []
  private bootedProviders: ServiceProviderInterface[] = []

  // Initialize service manager with dependency injection container
  constructor(container: Container) {
    this.container = container
  }

  // Add a service provider to the list of providers to register
  public register(provider: ServiceProviderInterface): void {
    this.providers.push(provider)
  }

  // Register all service providers by calling their register methods
  public async registerAll(): Promise<void> {
    for (const provider of this.providers) {
      await provider.register(this.container)
      this.registeredProviders.push(provider)
    }
  }

  // Boot all registered providers that have a boot method
  public async bootAll(): Promise<void> {
    for (const provider of this.registeredProviders) {
      if (provider.boot) {
        await provider.boot(this.container)
        this.bootedProviders.push(provider)
      }
    }
  }

  // Shutdown all providers in reverse order and reset state
  public async shutdownAll(): Promise<void> {
    // Shutdown all registered providers (in reverse order), not just booted ones
    const providersToShutdown = [...this.registeredProviders].reverse()

    for (const provider of providersToShutdown) {
      if (provider.shutdown) {
        await provider.shutdown(this.container)
      }
    }

    this.bootedProviders = []
    this.registeredProviders = []
    this.providers = []
  }

  // Get a copy of all registered service providers
  public getRegisteredProviders(): ServiceProviderInterface[] {
    return [...this.registeredProviders]
  }

  // Get a copy of all booted service providers
  public getBootedProviders(): ServiceProviderInterface[] {
    return [...this.bootedProviders]
  }
}
