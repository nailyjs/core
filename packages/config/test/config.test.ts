import { AbstractBootstrap, Injectable, PostConstruct } from '@nailyjs/ioc'
import configuration from '../../../naily.config'
import { ConfigPlugin, Value } from '../src'

type Configuration = typeof configuration

describe('config module', () => {
  it('should work', async () => {
    @Injectable()
    class TestService {
      constructor(
        @Value<Configuration>('naily')
        public readonly paramConfig: string,
      ) {
        expect(paramConfig).toStrictEqual(configuration.naily)
      }

      @Value<Configuration>('naily')
      public readonly propertyConfig: string

      @PostConstruct()
      init() {
        expect(this.propertyConfig).toStrictEqual(configuration.naily)
      }
    }

    class Bootstrap extends AbstractBootstrap {
      getTestService(): TestService {
        const testServiceWrapper = this.getContainer().get(TestService)
        if (testServiceWrapper && testServiceWrapper.wrapperType === 'class') return testServiceWrapper.getClassFactory().getOrCreateInstance()
        return this.createClassWrapper(TestService).save().getClassFactory().getOrCreateInstance()
      }

      async run(): Promise<any> {
        await this.getPluginRunner().runBeforeRun()
        const testService = this.getTestService()
        expect(testService).toBeInstanceOf(TestService)
        expect(testService.paramConfig).toStrictEqual(configuration.naily)
        expect(testService.propertyConfig).toStrictEqual(configuration.naily)
      }
    }
    await new Bootstrap()
      .use(ConfigPlugin())
      .run()
  })
})
