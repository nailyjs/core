import type { CreateCacheOptions } from 'cache-manager'

export const Cache = '__naily_cache__'
export interface Cache {
  configure(options: CreateCacheOptions): CreateCacheOptions | Promise<CreateCacheOptions>
}
