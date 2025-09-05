import { Container } from '../Support/Container'
import { ServiceProviderInterface } from '../Contracts/ServiceProviderInterface'

/**
 * Abstract base class for service providers
 * Implements the ServiceProviderInterface with optional boot and shutdown methods
 */
export abstract class ServiceProvider implements ServiceProviderInterface {
  // Abstract method that must be implemented to register services
  public abstract register(container: Container): Promise<void> | void

  // Optional method called after all providers are registered
  public boot?(container: Container): Promise<void> | void

  // Optional method called during application shutdown
  public shutdown?(container: Container): Promise<void> | void
}
