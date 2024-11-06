import { Value } from '@nailyjs/config'
import { Autowired, ClassWrapper, Container, Optional, Service } from '@nailyjs/ioc'
import { createCache } from 'cache-manager'
import { CustomCacheManager } from './configure-cache-protocol'

export const CACHE_MANAGER = '__naily_cache_manager__'

@Service()
export class CacheFactoryService {
  constructor(
    @Value('naily.cacheManager')
    private cacheOptions: Naily.Configuration.NailyUserConfig['cacheManager'],
    @Optional()
    @Autowired(CustomCacheManager)
    private readonly configureService: CustomCacheManager,
  ) {}

  async setup(container: Container): Promise<void> {
    let cacheOptions = this.cacheOptions
    if (this.configureService && typeof this.configureService.configure === 'function')
      cacheOptions = await this.configureService.configure(cacheOptions)

    if (Array.isArray(cacheOptions)) {
      for (const cacheOption of cacheOptions) {
        const cacheInstance = createCache(cacheOption)
        container.createConstantWrapper(cacheOption.injectionToken, cacheInstance).save()
      }
    }
    else {
      const cacheInstance = createCache()
      container.createConstantWrapper(CACHE_MANAGER, cacheInstance).save()
    }
  }

  static getInstance(container: Container): CacheFactoryService {
    const wrapper = container.getContainer().get(CacheFactoryService) as ClassWrapper<CacheFactoryService>
    if (wrapper && wrapper.wrapperType === 'class') return wrapper.getClassFactory().getOrCreateInstance()
    return container.createClassWrapper(CacheFactoryService).getClassFactory().getOrCreateInstance()
  }
}
