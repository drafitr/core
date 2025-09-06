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
  private providerNames = new WeakMap<ServiceProviderInterface, string>()
  private nameCounter = 0

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
    const sortedProviders = this.topologicalSort(this.registeredProviders, false)
    
    for (const provider of sortedProviders) {
      if (provider.boot) {
        await provider.boot(this.container)
        this.bootedProviders.push(provider)
      }
    }
  }

  // Shutdown all providers in reverse dependency order and reset state
  public async shutdownAll(): Promise<void> {
    // Shutdown all registered providers in reverse dependency order
    const sortedProviders = this.topologicalSort(this.registeredProviders, true)

    for (const provider of sortedProviders) {
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

  // Get provider name for dependency resolution
  private getProviderName(provider: ServiceProviderInterface): string {
    // Check if we already assigned a name to this provider
    if (this.providerNames.has(provider)) {
      return this.providerNames.get(provider)!
    }

    let name: string
    
    if (provider.getProviderName) {
      name = provider.getProviderName()
    } else {
      // Use constructor name, but handle anonymous classes
      const constructorName = provider.constructor.name
      if (constructorName && constructorName !== 'Object' && constructorName !== '') {
        name = constructorName
      } else {
        // For anonymous classes, generate a unique name
        name = `AnonymousProvider_${++this.nameCounter}`
      }
    }
    
    // Store the name for this provider instance
    this.providerNames.set(provider, name)
    return name
  }

  // Get provider dependencies for dependency resolution
  private getProviderDependencies(provider: ServiceProviderInterface): string[] {
    return provider.getDependencies?.() || []
  }

  // Topological sort for dependency resolution
  private topologicalSort(providers: ServiceProviderInterface[], reverse: boolean = false): ServiceProviderInterface[] {
    if (providers.length === 0) {
      return []
    }

    // Get normal boot order first
    const bootOrder = this.getBootOrder(providers)
    
    // Return normal order for boot, reverse for shutdown
    return reverse ? [...bootOrder].reverse() : bootOrder
  }

  // Get boot order using topological sort
  private getBootOrder(providers: ServiceProviderInterface[]): ServiceProviderInterface[] {
    const graph = new Map<string, ServiceProviderInterface>()
    const inDegree = new Map<string, number>()
    const adjList = new Map<string, string[]>()

    // Build the graph
    for (const provider of providers) {
      const name = this.getProviderName(provider)
      graph.set(name, provider)
      inDegree.set(name, 0)
      adjList.set(name, [])
    }

    // Build adjacency list and calculate in-degrees
    // For boot: dependency -> dependent (dependencies must be booted first)
    for (const provider of providers) {
      const providerName = this.getProviderName(provider)
      const dependencies = this.getProviderDependencies(provider)

      for (const depName of dependencies) {
        if (!graph.has(depName)) {
          throw new Error(`Service provider '${providerName}' depends on '${depName}', but '${depName}' is not registered`)
        }
        
        // Dependency points to dependent
        adjList.get(depName)!.push(providerName)
        inDegree.set(providerName, inDegree.get(providerName)! + 1)
      }
    }

    // Kahn's algorithm for topological sorting
    const queue: string[] = []
    const result: ServiceProviderInterface[] = []

    // Find all nodes with no incoming edges (no dependencies)
    for (const [name, degree] of inDegree) {
      if (degree === 0) {
        queue.push(name)
      }
    }

    while (queue.length > 0) {
      const current = queue.shift()!
      const provider = graph.get(current)!
      result.push(provider)

      // Remove current node from the graph
      for (const neighbor of adjList.get(current)!) {
        const newDegree = inDegree.get(neighbor)! - 1
        inDegree.set(neighbor, newDegree)
        
        if (newDegree === 0) {
          queue.push(neighbor)
        }
      }
    }

    // Check for circular dependencies
    if (result.length !== providers.length) {
      const remaining = providers.filter(p => !result.includes(p))
      const remainingNames = remaining.map(p => this.getProviderName(p))
      throw new Error(`Circular dependency detected among service providers: ${remainingNames.join(', ')}`)
    }

    return result
  }
}
