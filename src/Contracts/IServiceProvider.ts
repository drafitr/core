import { Container } from '../Support/Container'
import type { Token } from '@needle-di/core'

/**
 * Interface defining the contract for service providers
 * Service providers are responsible for registering and managing services in the container
 */
export interface IServiceProvider {
  // Required method to register services with the container
  register(container: Container): Promise<void> | void
  // Optional method called after all services are registered
  boot?(container: Container): Promise<void> | void
  // Optional method called during graceful shutdown
  shutdown?(container: Container): Promise<void> | void
  // Optional method to declare dependencies on service interfaces (tokens)
  getDependencies?(): Token<any>[]
  // Optional method to declare what services this provider provides
  getProvidedServices?(): Token<any>[]
  // Optional method to provide a unique identifier for this service provider
  getProviderName?(): string
}
