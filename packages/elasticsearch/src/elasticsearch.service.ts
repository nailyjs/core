import { Value } from '@nailyjs/config'
import { Autowired, ClassWrapper, Container, Optional, Service } from '@nailyjs/ioc'
import { CustomElasticsearch } from './configure-elasticsearch-protocol'
import { ElasticSearchClient } from './types'

@Service()
export class ElasticsearchFactoryService {
  constructor(
    @Value('naily.elasticsearch')
    private readonly elasticsearchOptions: Naily.Configuration.NailyUserConfig['elasticsearch'],
    @Optional()
    @Autowired(CustomElasticsearch)
    private readonly configureService: CustomElasticsearch,
  ) {}

  async setup(container: Container, Client: ElasticSearchClient): Promise<void> {
    let elasticsearchOptions = this.elasticsearchOptions
    if (this.configureService && typeof this.configureService.configure === 'function')
      elasticsearchOptions = await this.configureService.configure(elasticsearchOptions, Client)

    if (Array.isArray(elasticsearchOptions)) {
      for (const i in elasticsearchOptions) {
        if (!Client[i])
          throw new Error(`[ElasticSearch] Client[${i}] is not defined in the Client array, please check you naily.config.ts and make sure the client is defined in the 'ElasticSearchPlugin(/* Client */)'.`)
        container.createConstantWrapper(elasticsearchOptions[i].injectionToken, new Client[i](elasticsearchOptions[i])).save()
      }
    }
    else {
      const SingletonClient = Array.isArray(Client) ? Client[0] : Client
      container.createConstantWrapper(SingletonClient, new SingletonClient(elasticsearchOptions)).save()
    }
  }

  static getInstance(container: Container): ElasticsearchFactoryService {
    const wrapper = container.getContainer().get(ElasticsearchFactoryService) as ClassWrapper<ElasticsearchFactoryService>
    if (wrapper && wrapper.wrapperType === 'class') return wrapper.getClassFactory().getOrCreateInstance()
    return container.createClassWrapper(ElasticsearchFactoryService).getClassFactory().getOrCreateInstance()
  }
}
