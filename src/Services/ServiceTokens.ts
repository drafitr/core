import { InjectionToken } from '@needle-di/core'
import type { IDatabaseService } from '../Contracts/IDatabaseService'
import type { ICacheService } from '../Contracts/ICacheService'
import type { ILoggerService } from '../Contracts/ILoggerService'
import type { IConfigService } from '../Contracts/IConfigService'
import type { IHttpService } from '../Contracts/IHttpService'
import type { IQueueService } from '../Contracts/IQueueService'
import type { IStorageService } from '../Contracts/IStorageService'

/**
 * Service tokens for dependency injection
 * These tokens represent service interfaces rather than specific implementations
 */

// Service tokens - these represent common service interfaces
export const DATABASE_SERVICE = new InjectionToken<IDatabaseService>('DatabaseService')
export const CACHE_SERVICE = new InjectionToken<ICacheService>('CacheService') 
export const LOGGER_SERVICE = new InjectionToken<ILoggerService>('LoggerService')
export const CONFIG_SERVICE = new InjectionToken<IConfigService>('ConfigService')
export const HTTP_SERVICE = new InjectionToken<IHttpService>('HttpService')
export const QUEUE_SERVICE = new InjectionToken<IQueueService>('QueueService')
export const STORAGE_SERVICE = new InjectionToken<IStorageService>('StorageService')