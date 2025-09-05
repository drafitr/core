import { Container as NeedleContainer } from '@needle-di/core'
import type { Token } from '@needle-di/core'

/**
 * Extended dependency injection container built on top of Needle DI
 * Provides additional convenience methods for binding and resolving dependencies
 */
export class Container extends NeedleContainer {
  // Bind a concrete value to a token
  public bindValue<T>(token: Token<T>, value: T): this {
    return this.bind({ provide: token, useValue: value })
  }

  // Bind a factory function to a token for dynamic value creation
  public bindFactory<T>(token: Token<T>, factory: (container: NeedleContainer) => T): this {
    return this.bind({ provide: token, useFactory: factory })
  }

  // Bind a factory function as a singleton (creates instance only once)
  public bindFactoryAsSingleton<T>(
    token: Token<T>,
    factory: (container: NeedleContainer) => T
  ): this {
    let instance: T | undefined
    let isCreated = false

    return this.bind({
      provide: token,
      useFactory: (container) => {
        if (!isCreated) {
          instance = factory(container)
          isCreated = true
        }
        return instance!
      },
    })
  }

  // Bind a class constructor to a token
  public bindClass<T>(token: Token<T>, useClass: new (...args: any[]) => T): this {
    return this.bind({ provide: token, useClass })
  }

  // Resolve a dependency from the container
  public resolve<T>(token: Token<T>): T {
    return this.get(token)
  }

  // Resolve a dependency optionally (returns undefined if not found)
  public resolveOptional<T>(token: Token<T>): T | undefined {
    return this.get(token, { optional: true })
  }

  // Check if a token is bound in the container
  public isBound<T>(token: Token<T>): boolean {
    return this.has(token)
  }
}
