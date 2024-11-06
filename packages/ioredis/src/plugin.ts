import { Container, IocPlugin } from '@nailyjs/ioc'
import { IORedisFactoryService } from './ioredis.service'

class IoRedisPluginImpl implements IocPlugin {
  name: string = 'naily:ioredis-plugin'

  async beforeRun(container: Container): Promise<void> {
    await IORedisFactoryService.getInstance(container).setup(container)
  }
}

export function IoRedisPlugin(): IocPlugin {
  return new IoRedisPluginImpl()
}
