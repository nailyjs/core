import { ConfigPlugin } from '@nailyjs/config'
import { AbstractBootstrap, Autowired } from '@nailyjs/ioc'
import * as winston from 'winston'
import { WinstonPlugin } from '../src'

describe('winston', () => {
  it('should work', () => {
    class TestService {
      constructor(
        @Autowired(winston.Logger)
        private readonly logger: winston.Logger,
      ) {}

      log() {
        this.logger.info('test info level')
        this.logger.error('test error level')
        this.logger.warn('test warn level')
        this.logger.debug('test debug level')
        this.logger.verbose('test verbose level')
        this.logger.silly('test silly level')
      }
    }

    class Bootstrap extends AbstractBootstrap {
      async run(): Promise<any> {
        await this.getPluginRunner().runBeforeRun()
        this.createClassWrapper(TestService)
          .save()
          .getClassFactory()
          .getOrCreateInstance<TestService>()
          .log()
      }
    }

    new Bootstrap()
      .use(ConfigPlugin())
      .use(WinstonPlugin())
      .run()
  })
})
