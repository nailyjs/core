import { Value } from '@nailyjs/config'
import { Autowired, ClassWrapper, Container, Optional, Service } from '@nailyjs/ioc'
import Redis from 'ioredis'
import { CustomIoRedis } from './configure-ioredis-protocol'

@Service()
export class IORedisFactoryService {
  constructor(
    @Value('naily.ioRedis')
    private readonly ioRedisOptions: Naily.Configuration.NailyUserConfig['ioRedis'],
    @Optional()
    @Autowired(CustomIoRedis)
    private readonly configureService: CustomIoRedis,
  ) {}

  async setup(container: Container): Promise<void> {
    let ioRedisOptions = this.ioRedisOptions
    if (this.configureService && typeof this.configureService.configure === 'function')
      ioRedisOptions = await this.configureService.configure(ioRedisOptions)

    if (Array.isArray(ioRedisOptions)) {
      for (const ioRedisOption of ioRedisOptions) {
        const ioRedisInstance = new Redis(ioRedisOption)
        await ioRedisInstance.connect()
        container.createConstantWrapper(ioRedisOption.injectionToken, ioRedisInstance).save()
      }
    }
    else {
      const ioRedisInstance = new Redis(ioRedisOptions)
      await ioRedisInstance.connect()
      container.createConstantWrapper(Redis, ioRedisInstance).save()
    }
  }

  static getInstance(container: Container): IORedisFactoryService {
    const wrapper = container.getContainer().get(IORedisFactoryService) as ClassWrapper<IORedisFactoryService>
    if (wrapper && wrapper.wrapperType === 'class') return wrapper.getClassFactory().getOrCreateInstance()
    return container.createClassWrapper(IORedisFactoryService).getClassFactory().getOrCreateInstance()
  }
}
