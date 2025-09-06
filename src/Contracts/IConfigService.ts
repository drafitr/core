/**
 * Configuration service interface contract
 * Defines the contract for configuration management
 */
export interface IConfigService {
  get<T = any>(key: string, defaultValue?: T): T
  has(key: string): boolean
  set(key: string, value: any): void
}