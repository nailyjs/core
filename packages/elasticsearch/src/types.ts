import { ClientOptions } from '@elastic/elasticsearch'
import { InjectionTokenable } from '@nailyjs/ioc'

declare global {
  namespace Naily {
    namespace Configuration {
      interface NailyUserConfig {
        elasticsearch?: ElasticsearchOptions | InjectionTokenable<ElasticsearchOptions>[]
      }
      interface NailyUserIntelliSense {
        elasticsearch?: ElasticsearchOptions
      }
    }
  }
}

export type ElasticSearchClient = (new (options: ElasticsearchOptions) => any) | (new (options: ElasticsearchOptions) => any)[]

export interface ElasticsearchOptions extends ClientOptions {
  [key: string]: any
}
