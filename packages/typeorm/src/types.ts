import { MixedList } from 'typeorm'
import { EntitySchema } from 'typeorm/browser'

// eslint-disable-next-line ts/no-unsafe-function-type
export type Entities = MixedList<Function | string | EntitySchema>
export type AsyncableCallback<T> = () => Promise<T> | T
export interface TypeOrmPluginOptions {
  entities?: Entities | AsyncableCallback<Entities>
}
