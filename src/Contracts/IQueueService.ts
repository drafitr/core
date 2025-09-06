/**
 * Queue service interface contract
 * Defines the contract for message queue operations
 */
export interface IQueueService {
  publish(queue: string, data: any): Promise<void>
  subscribe(queue: string, handler: (data: any) => Promise<void>): Promise<void>
  disconnect(): Promise<void>
}