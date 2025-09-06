import { Container } from '../Support/Container'

/**
 * Interface defining the contract for service providers
 * Service providers are responsible for registering and managing services in the container
 */
export interface ServiceProviderInterface {
  // Required method to register services with the container
  register(container: Container): Promise<void> | void
  // Optional method called after all services are registered
  boot?(container: Container): Promise<void> | void
  // Optional method called during graceful shutdown
  shutdown?(container: Container): Promise<void> | void
  // Optional method to declare dependencies on other service providers
  getDependencies?(): string[]
  // Optional method to provide a unique identifier for this service provider
  getProviderName?(): string
}
