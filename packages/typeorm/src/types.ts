import type { DataSourceOptions, EntitySchema, MixedList } from 'typeorm'

// eslint-disable-next-line ts/no-unsafe-function-type
export type Entities = MixedList<Function | string | EntitySchema>
export type AsyncableCallback<T> = () => Promise<T> | T
export interface TypeOrmPluginOptions {
  entities?: Entities | AsyncableCallback<Entities>
}

declare global {
  namespace Naily {
    namespace Configuration {
      interface NailyUserConfig {
        /** TypeORM configuration */
        typeorm?: Omit<DataSourceOptions, 'entities'>
      }
      interface NailyUserIntelliSense {
        typeorm?: DataSourceOptions
      }
    }
  }
}
