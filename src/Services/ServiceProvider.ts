import { Container } from '../Support/Container'
import { IServiceProvider } from '../Contracts/IServiceProvider'
import type { Token } from '@needle-di/core'

/**
 * Abstract base class for service providers
 * Implements the IServiceProvider with optional boot and shutdown methods
 */
export abstract class ServiceProvider implements IServiceProvider {
  // Abstract method that must be implemented to register services
  public abstract register(container: Container): Promise<void> | void

  // Optional method called after all providers are registered
  public boot?(container: Container): Promise<void> | void

  // Optional method called during application shutdown
  public shutdown?(container: Container): Promise<void> | void

  // Optional method to declare dependencies on service interfaces (tokens)
  public getDependencies?(): Token<any>[]

  // Optional method to declare what services this provider provides
  public getProvidedServices?(): Token<any>[]

  // Optional method to provide a unique identifier for this service provider
  public getProviderName?(): string
}
