import { Application } from './Application'
import { ServiceProviderInterface } from '../Contracts/ServiceProviderInterface'

/**
 * Application kernel that orchestrates the application startup process
 * Manages service provider registration and application lifecycle
 */
export class Kernel {
  private application: Application
  private serviceProviders: ServiceProviderInterface[] = []

  // Initialize kernel with optional service providers
  constructor(serviceProviders: ServiceProviderInterface[] = []) {
    this.application = new Application()
    this.serviceProviders = serviceProviders
  }

  // Get the underlying application instance
  public getApplication(): Application {
    return this.application
  }

  // Register a new service provider with the kernel
  public registerServiceProvider(serviceProvider: ServiceProviderInterface): this {
    this.serviceProviders.push(serviceProvider)
    return this
  }

  // Start the application by registering providers and running the app
  public async start(): Promise<Application> {
    for (const provider of this.serviceProviders) {
      this.application.register(provider)
    }

    await this.application.run()
    return this.application
  }

  // Stop the application gracefully
  public async stop(): Promise<void> {
    await this.application.shutdown()
  }
}
