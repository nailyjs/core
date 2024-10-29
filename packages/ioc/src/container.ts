import type { ContainerProtocol } from './container-protocol'
import type { InjectWrapper } from './inject-wrapper'
import type { InjectableWrapper } from './injectable-wrapper'
import type { Class, InjectionToken } from './types'

export class Container implements ContainerProtocol {
  private static markedInjectable = new Set<InjectableWrapper>()
  private static markedInject = new Set<InjectWrapper>()

  getInjectContainer(): Set<InjectWrapper> {
    return Container.markedInject
  }

  getInjectableContainer(): Set<InjectableWrapper> {
    return Container.markedInjectable
  }

  getInjectableTarget(comparisonTarget: Class): InjectableWrapper | undefined {
    if (!comparisonTarget) return
    return Array.from(Container.markedInjectable).find(wrapper => wrapper.getTarget() === comparisonTarget) as InjectableWrapper
  }

  getInjectableTargetByToken(comparisonToken: InjectionToken): InjectableWrapper | undefined {
    if (!comparisonToken) return
    return Array.from(Container.markedInjectable).find(wrapper => wrapper.getInjectableOptions().injectionToken === comparisonToken) as InjectableWrapper
  }

  getInjectableByTargetOrToken(comparison: Class | InjectionToken): InjectableWrapper | undefined {
    if (!comparison) return
    return Array.from(Container.markedInjectable).find((wrapper) => {
      const injectableOptions = wrapper.getInjectableOptions()
      return injectableOptions.injectionToken === comparison || wrapper.getTarget() === comparison
    }) as InjectableWrapper
  }

  hasInjectableTarget(comparisonTarget: Class): boolean {
    return Array.from(Container.markedInjectable).some(wrapper => wrapper.getTarget() === comparisonTarget)
  }

  replaceInjectableContainer(injectableContainer: Set<InjectableWrapper>): void {
    Container.markedInjectable = injectableContainer
  }

  replaceInjectContainer(injectContainer: Set<InjectWrapper>): void {
    Container.markedInject = injectContainer
  }
}
