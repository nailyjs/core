import { AbstractBootstrap, Injectable } from '@nailyjs/ioc'
import { Interval, SchedulePlugin, Timeout } from '../src'

describe('schedule test', () => {
  it('should work', async () => {
    @Injectable()
    class _TestService {
      @Interval(1000)
      async test() {
        console.log('test, interval')
      }

      @Timeout(10)
      async test2() {
        console.log('test2, timeout')
      }
    }

    class Bootstrap extends AbstractBootstrap {
      async run(): Promise<any> {
        await this.getPluginRunner().runBeforeRun()
      }
    }
    await new Bootstrap().use(SchedulePlugin()).run()
  })
})
