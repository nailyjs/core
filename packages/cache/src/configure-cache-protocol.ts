export const CustomCacheManager = '__naily_custom_cache_manager__'
export interface CustomCacheManager {
  configure(cacheManagerOptions: Naily.Configuration.NailyUserConfig['cache']): Naily.Configuration.NailyUserConfig['cache'] | Promise<Naily.Configuration.NailyUserConfig['cache']>
}
