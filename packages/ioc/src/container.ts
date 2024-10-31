import type { Saveable } from './protocols'
import type { Class, InjectionToken } from './types'
import { ClassWrapper } from './wrappers/class-wrapper'
import { ConstantWrapper } from './wrappers/constant-wrapper'

export class Container implements Saveable {
  private static map = new Map<InjectionToken, ClassWrapper | ConstantWrapper>()

  getContainer(): Map<InjectionToken, ClassWrapper | ConstantWrapper> {
    return Container.map
  }

  replaceContainer(container: Map<InjectionToken, ClassWrapper | ConstantWrapper>): void {
    Container.map = container
  }

  createClassWrapper<T>(target: Class<T>): ClassWrapper {
    return new ClassWrapper<T>(target)
  }

  createConstantWrapper(injectionToken: InjectionToken, value: any): ConstantWrapper {
    return new ConstantWrapper(injectionToken, value)
  }

  save(wrapper: ClassWrapper | ConstantWrapper): void {
    Container.map.set(wrapper.getInjectionToken(), wrapper)
  }
}
