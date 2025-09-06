/**
 * Cache service interface contract
 * Defines the contract for cache operations
 */
export interface ICacheService {
  get<T = any>(key: string): Promise<T | null>
  set(key: string, value: any, ttl?: number): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
}