import { Application, ServiceProvider, Container } from '@drafitr/core'
import { InjectionToken } from '@needle-di/core'

const HELLO_SERVICE = new InjectionToken<HelloService>('HelloService')

// A hello service class
class HelloService {
  sayIt() {
    console.log('Hello, Dependency Injection!')
  }
}

// Create a simple service provider
class HelloServiceProvider extends ServiceProvider {
  register(container: Container): void {
    container.bindClass(HELLO_SERVICE, HelloService)
  }

  boot(container: Container): void {
    const service = container.resolve(HELLO_SERVICE)
    service.sayIt()
  }
}

// Bootstrap and run the application
const app = new Application()
app.register(new HelloServiceProvider())
await app.run()
