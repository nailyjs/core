import type { ContainerProtocol } from './container-protocol'
import type { InjectOptions } from './decorators'
import type { InjectableWrapper } from './injectable-wrapper'
import type { Class } from './types'
import { MarkedInject, MarkedInjectable } from './constants/container-constant'

export class Container implements ContainerProtocol {
  getInjectContainer(): Set<Partial<InjectOptions>> {
    return MarkedInject
  }

  getInjectableContainer(): Set<InjectableWrapper> {
    return MarkedInjectable
  }

  getInjectableTarget(comparisonTarget: Class): InjectableWrapper | undefined {
    return Array.from(MarkedInjectable).find(wrapper => wrapper.getTarget() === comparisonTarget) as InjectableWrapper
  }

  hasInjectableTarget(comparisonTarget: Class): boolean {
    return Array.from(MarkedInjectable).some(wrapper => wrapper.getTarget() === comparisonTarget)
  }
}
