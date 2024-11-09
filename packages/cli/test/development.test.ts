import { ConfigPlugin } from '@nailyjs/config'
import { AbstractBootstrap } from '@nailyjs/ioc'
import { DevelopmentStarter } from '../src'

describe('cli development test', () => {
  it('should work', async () => {
    class Bootstrap extends AbstractBootstrap {
      async run() {
        await this.getPluginRunner().runBeforeRun()
        const dev = DevelopmentStarter.getInstance(this)
        console.log(dev)
      }
    }
    new Bootstrap()
      .use(ConfigPlugin())
      .run()
  })
})
