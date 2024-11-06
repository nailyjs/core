import { InjectionTokenable } from '@nailyjs/ioc'
import * as winston from 'winston'

declare global {
  namespace Naily {
    namespace Configuration {
      interface NailyUserConfig {
        /** Logger options. */
        logger?: {
          /** Winston logger options. */
          winston?: WinstonOptions | InjectionTokenable<WinstonOptions>[]
        }
      }
      interface NailyUserIntelliSense {
        /** Logger options. */
        logger?: {
          /** Winston logger options. */
          winston?: WinstonOptions
        }
      }
    }
  }
}

export interface WinstonOptions extends winston.LoggerOptions {
}
