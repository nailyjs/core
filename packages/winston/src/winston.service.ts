import { Value } from '@nailyjs/config'
import { Autowired, ClassWrapper, Container, Optional, Service } from '@nailyjs/ioc'
import * as winston from 'winston'
import { CustomWinston } from './configure-winston-protocol'

@Service()
export class WinstonFactoryService {
  constructor(
    @Value('naily.logger.winston')
    private readonly winstonOptions: Naily.Configuration.NailyUserConfig['logger']['winston'],
    @Autowired()
    @Optional()
    private readonly configureService: CustomWinston,
  ) {}

  async setup(container: Container): Promise<void> {
    let winstonOptions = this.winstonOptions

    if (this.configureService && typeof this.configureService.configure === 'function')
      winstonOptions = await this.configureService.configure(this.winstonOptions)

    if (Array.isArray(winstonOptions)) {
      for (const option of winstonOptions) {
        container.createConstantWrapper(option.injectionToken, winston.createLogger(option)).save()
      }
    }
    else {
      container.createConstantWrapper(winston.Logger, winston.createLogger(winstonOptions)).save()
    }
  }

  static getInstance(container: Container): WinstonFactoryService {
    const wrapper = container.getContainer().get(WinstonFactoryService) as ClassWrapper<WinstonFactoryService>
    if (wrapper && wrapper.wrapperType === 'class') return wrapper.getClassFactory().getOrCreateInstance()
    return container.createClassWrapper(WinstonFactoryService).getClassFactory().getOrCreateInstance()
  }
}
