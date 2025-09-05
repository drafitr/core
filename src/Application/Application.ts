import { Container } from '../Support/Container'
import { ServiceManager } from '../Services/ServiceManager'
import { ServiceProviderInterface } from '../Contracts/ServiceProviderInterface'

/**
 * Main application class that manages the application lifecycle
 * Handles dependency injection container, service providers, and application state
 */
export class Application {
  private container: Container
  private serviceManager: ServiceManager
  private isBootstrapped = false
  private isBooted = false

  // Initialize application with new container and service manager
  constructor() {
    this.container = new Container()
    this.serviceManager = new ServiceManager(this.container)
  }

  // Get the dependency injection container
  public getContainer(): Container {
    return this.container
  }

  // Get the service manager instance
  public getServiceManager(): ServiceManager {
    return this.serviceManager
  }

  // Register a service provider with the application
  public register(serviceProvider: ServiceProviderInterface): this {
    this.serviceManager.register(serviceProvider)
    return this
  }

  // Bootstrap the application by registering all service providers
  public async bootstrap(): Promise<this> {
    if (this.isBootstrapped) {
      throw new Error('Application is already bootstrapped')
    }

    await this.serviceManager.registerAll()
    this.isBootstrapped = true
    return this
  }

  // Boot the application by running boot methods on all registered providers
  public async boot(): Promise<this> {
    if (!this.isBootstrapped) {
      throw new Error('Application must be bootstrapped before booting')
    }

    if (this.isBooted) {
      throw new Error('Application is already booted')
    }

    await this.serviceManager.bootAll()
    this.isBooted = true
    return this
  }

  // Gracefully shutdown the application and all services
  public async shutdown(): Promise<void> {
    if (!this.isBooted) {
      return
    }

    await this.serviceManager.shutdownAll()
    this.isBooted = false
    this.isBootstrapped = false
  }

  // Check if the application is fully running (bootstrapped and booted)
  public isRunning(): boolean {
    return this.isBootstrapped && this.isBooted
  }

  // Convenience method to bootstrap and boot the application in one call
  public async run(): Promise<void> {
    await this.bootstrap()
    await this.boot()
  }
}
