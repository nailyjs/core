import { DataSourceOptions } from 'typeorm'

declare global {
  namespace Naily {
    namespace Configuration {
      interface NailyUserConfig {
        /** TypeORM configuration */
        typeorm?: DataSourceOptions
      }
      interface NailyUserIntelliSense {
        typeorm?: DataSourceOptions
      }
    }
  }
}
