import { Container, IocPlugin } from '@nailyjs/ioc'
import { WinstonFactoryService } from './winston.service'

class WinstonPluginImpl implements IocPlugin {
  name: string = 'naily:winston-plugin'

  async beforeRun(container: Container): Promise<void> {
    await WinstonFactoryService.getInstance(container).setup(container)
  }
}

export function WinstonPlugin(): IocPlugin {
  return new WinstonPluginImpl()
}
