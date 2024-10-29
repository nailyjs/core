import type { InjectWrapper } from './inject-wrapper'
import type { InjectableWrapper } from './injectable-wrapper'
import type { Class } from './types'

export interface ContainerProtocol {
  /**
   * ### Get the Injectable Container.
   *
   * @return {Set<InjectableWrapper>}
   * @memberof ContainerProtocol
   */
  getInjectableContainer(): Set<InjectableWrapper>
  /**
   * ### Get the Inject Container.
   *
   * @return {Set<Partial<InjectOptions>>}
   * @memberof ContainerProtocol
   */
  getInjectContainer(): Set<InjectWrapper>
  /**
   * ### Get the Injectable Target.
   *
   * @param {Class} comparisonTarget The target to compare.
   * @return {InjectableWrapper}
   * @memberof ContainerProtocol
   */
  getInjectableTarget(comparisonTarget: Class): InjectableWrapper | undefined
  /**
   * ### Check if the Injectable Target exists.
   *
   * @param {Class} comparisonTarget The target to compare.
   * @return {boolean}
   * @memberof ContainerProtocol
   */
  hasInjectableTarget(comparisonTarget: Class): boolean
}
