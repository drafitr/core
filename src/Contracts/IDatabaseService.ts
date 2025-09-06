/**
 * Database service interface contract
 * Defines the contract for database operations
 */
export interface IDatabaseService {
  connect(): Promise<void>
  disconnect(): Promise<void>
  query<T = any>(sql: string, params?: any[]): Promise<T[]>
  transaction<T>(callback: (tx: any) => Promise<T>): Promise<T>
}