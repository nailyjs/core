import type { BackendPluginProtocol } from '@nailyjs/backend'
import { InjectableWrapper } from '@nailyjs/ioc'
import { CacheProvider } from './cache-provider'

export class CachePluginImpl implements BackendPluginProtocol {
  name: string = 'naily:backend:cache-plugin'

  install(): void {
    InjectableWrapper.getOrCreateInjectableWrapper(CacheProvider).getOrCreateInstance()
  }
}

export function CachePlugin(): BackendPluginProtocol {
  return new CachePluginImpl()
}
