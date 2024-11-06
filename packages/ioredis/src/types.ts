import { InjectionTokenable } from '@nailyjs/ioc'
import { RedisOptions } from 'ioredis'

declare global {
  namespace Naily {
    namespace Configuration {
      interface NailyUserConfig {
        ioRedis?: IoRedisOptions | InjectionTokenable<IoRedisOptions>[]
      }
      interface NailyUserIntelliSense {
        ioRedis?: IoRedisOptions
      }
    }
  }
}

export interface IoRedisOptions extends RedisOptions {}
