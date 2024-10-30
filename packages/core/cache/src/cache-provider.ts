import type { Events } from 'cache-manager'
import type { CacheOptions } from './types'
import { Value } from '@nailyjs/config'
import { Injectable } from '@nailyjs/ioc'
import { createCache } from 'cache-manager'

declare global {
  export namespace Naily {
    export interface NailyConfig {
      /** Specifies the cache-manager configuration. */
      cache: CacheOptions
    }
  }
}

@Injectable()
export class CacheProvider implements ReturnType<typeof createCache> {
  private readonly cacheInstance: ReturnType<typeof createCache>

  constructor(
    @Value('naily.cache')
    private readonly cacheOptions: CacheOptions,
  ) {
    this.cacheInstance = createCache(this.cacheOptions)
  }

  getCacheOptions(): CacheOptions {
    return this.cacheOptions
  }

  get: <T>(key: string) => Promise<T | null> = key => this.cacheInstance.get(key)
  mget: <T>(keys: string[]) => Promise<[T]> = keys => this.cacheInstance.mget(keys)
  set: <T>(key: string, value: T, ttl?: number) => Promise<T> = (key, value, ttl) => this.cacheInstance.set(key, value, ttl)
  mset: <T>(list: Array<{ key: string, value: T, ttl?: number }>) => Promise<{ key: string, value: T, ttl?: number }[]> = list => this.cacheInstance.mset(list)
  del: (key: string) => Promise<boolean> = key => this.cacheInstance.del(key)
  mdel: (keys: string[]) => Promise<boolean> = keys => this.cacheInstance.mdel(keys)
  clear: () => Promise<boolean> = () => this.cacheInstance.clear()
  wrap: <T>(key: string, fnc: () => T | Promise<T>, ttl?: number | ((value: T) => number), refreshThreshold?: number) => Promise<T> = (key, fnc, ttl, refreshThreshold) => this.cacheInstance.wrap(key, fnc, ttl, refreshThreshold)
  on: <E extends keyof Events>(event: E, listener: Events[E]) => import('events') <[never]> = (event, listener) => this.cacheInstance.on(event, listener)
  off: <E extends keyof Events>(event: E, listener: Events[E]) => import('events') <[never]> = (event, listener) => this.cacheInstance.off(event, listener)
}
