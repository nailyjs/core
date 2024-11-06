import { InjectionTokenable } from '@nailyjs/ioc'
import { CreateCacheOptions } from 'cache-manager'

declare global {
  namespace Naily {
    namespace Configuration {
      interface NailyUserConfig {
        /**
         * Cache manager options.
         *
         * @see https://github.com/jaredwray/cacheable
         * @see https://www.npmjs.com/package/cache-manager
         */
        cacheManager?: CacheManagerOptions | InjectionTokenable<CacheManagerOptions>[]
      }
      interface NailyUserIntelliSense {
        cacheManager?: CacheManagerOptions
      }
    }
  }
}

export interface CacheManagerOptions extends CreateCacheOptions {
}
