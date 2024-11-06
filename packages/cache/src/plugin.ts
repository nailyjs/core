import { Container, IocPlugin } from '@nailyjs/ioc'
import { CacheFactoryService } from './cache.service'

class CachePluginImpl implements IocPlugin {
  name: string = 'naily:cache-manager-plugin'

  beforeRun(container: Container): void {
    CacheFactoryService.getInstance(container).setup(container)
  }
}

export function CachePlugin(): IocPlugin {
  return new CachePluginImpl()
}
