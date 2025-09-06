/**
 * HTTP service interface contract
 * Defines the contract for HTTP server operations
 */
export interface IHttpService {
  listen(port: number): Promise<void>
  close(): Promise<void>
  addMiddleware(middleware: any): void
  addRoute(method: string, path: string, handler: any): void
}