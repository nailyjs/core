import { ElasticSearchClient } from './types'

export const CustomElasticsearch = '__naily_custom_elasticsearch__'
export interface CustomElasticsearch {
  configure(
    cacheManagerOptions: Naily.Configuration.NailyUserConfig['elasticsearch'],
    client: ElasticSearchClient
  ): Naily.Configuration.NailyUserConfig['elasticsearch'] | Promise<Naily.Configuration.NailyUserConfig['elasticsearch']>
}
