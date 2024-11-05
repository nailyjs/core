import type { Container } from '../container'
import type { IocPlugin } from '../protocols'
import { FilterWatermark, InjectableWatermark, InjectWatermark, PostConstructWatermark } from '../constant'

class InternalConstantPluginImpl implements IocPlugin {
  name: string = 'naily:internal-constant-plugin'

  beforeRun(container: Container): void {
    container.createConstantWrapper(InjectableWatermark, InjectableWatermark).save()
    container.createConstantWrapper(InjectWatermark, InjectWatermark).save()
    container.createConstantWrapper(FilterWatermark, FilterWatermark).save()
    container.createConstantWrapper(PostConstructWatermark, PostConstructWatermark).save()
  }
}

export function InternalConstantPlugin(): IocPlugin {
  return new InternalConstantPluginImpl()
}
