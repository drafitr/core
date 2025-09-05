# @drafitr/core

Core foundation for the Drafitr web framework - a highly opinionated TypeScript framework built on Bun and PostgreSQL.

## Etymology

**Drafitr** comes from the Malagasy language, meaning "structure/plan" (from 'rafitra' or 'drafitra'). This represents the framework's focus on structured, planned architecture.

## Architecture

Drafitr follows a service-oriented architecture where **everything is a service with a provider**. The core provides:

- Application orchestration
- Service provider lifecycle management  
- Basic utilities and support functions

## Installation

```bash
bun install @drafitr/core
```

## Quick Start

```typescript
import { Application, ServiceProvider } from '@drafitr/core';
import { Container } from '@needle-di/core';

// Create a simple service provider
class MyServiceProvider extends ServiceProvider {
  register(container: Container): void {
    container.bind('myService').toConstantValue({
      sayHello: () => console.log('Hello from Drafitr!')
    });
  }

  boot(container: Container): void {
    const service = container.resolve('myService');
    service.sayHello();
  }
}

// Bootstrap and run the application
const app = new Application();
app.register(new MyServiceProvider());
await app.run();
```

## Service Provider Lifecycle

Service providers follow a three-phase lifecycle:

1. **Register** - Register services in the DI container
2. **Boot** - Initialize and configure services after all registration
3. **Shutdown** - Clean up resources and graceful shutdown

## Core Modules

### Application
- `Application` - Main application class for bootstrapping
- `Kernel` - Application kernel for service orchestration

### Contracts
- `ServiceProviderInterface` - Service provider contract
  
### Services  
- `ServiceProvider` - Abstract base service provider class
- `ServiceManager` - Manages service provider lifecycle

### Support
- `Container` - Enhanced DI container wrapper
- `Exceptions` - Structured exception hierarchy

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Type check
bun run typecheck

# Build
bun run build
```

## Related Packages

- `@drafitr/http` - HTTP service (Request, Response, Middleware)
- `@drafitr/config` - Configuration management service
- `@drafitr/logging` - Logging service
- `@drafitr/events` - Event dispatcher service
- `@drafitr/db` - Database utilities and migrations
- `@drafitr/orm` - PostgreSQL ORM
- `@drafitr/auth` - Authentication service
- `@drafitr/cli` - Command line interface

## Design Principles

- **Modularity** - Core provides minimal foundation, everything else is pluggable
- **Simplicity** - Clean APIs
- **Type Safety** - Full TypeScript support with strong typing
- **Service Oriented** - All functionality delivered through service providers
- **Opinionated** - Strong conventions to reduce decision fatigue

## License

MIT
