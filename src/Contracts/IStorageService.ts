/**
 * Storage service interface contract
 * Defines the contract for file storage operations
 */
export interface IStorageService {
  read(path: string): Promise<Buffer | null>
  write(path: string, data: Buffer | string): Promise<void>
  exists(path: string): Promise<boolean>
  delete(path: string): Promise<void>
}