import { Container, IocPlugin } from '@nailyjs/ioc'
import { ElasticsearchFactoryService } from './elasticsearch.service'
import { ElasticSearchClient } from './types'

class ElasticsearchPluginImpl implements IocPlugin {
  name: string = 'naily:elasticsearch-plugin'

  constructor(private readonly client: ElasticSearchClient) {}

  async beforeRun(container: Container): Promise<void> {
    await ElasticsearchFactoryService.getInstance(container).setup(container, this.client)
  }
}

export function ElasticsearchPlugin(client: ElasticSearchClient): IocPlugin {
  return new ElasticsearchPluginImpl(client)
}
