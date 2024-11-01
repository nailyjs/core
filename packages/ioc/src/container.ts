import type { Saveable } from './protocols'
import type { Class, InjectionToken } from './types'
import { Injectable } from './decorators'
import { TaskRunner } from './task-runner'
import { ClassWrapper } from './wrappers/class-wrapper'
import { ConstantWrapper } from './wrappers/constant-wrapper'

@Injectable()
export class Container implements Saveable {
  private static map = new Map<InjectionToken, ClassWrapper | ConstantWrapper>()

  getContainer(): Map<InjectionToken, ClassWrapper | ConstantWrapper> {
    return Container.map
  }

  private _taskRunner: TaskRunner | null = null
  /**
   * ### Get task runner.
   *
   * @description Get task runner for the class.
   * @param cache - if false, it will create a new instance of task runner. Default is `true`.
   */
  getTaskRunner(cache: boolean = true): TaskRunner {
    if (this._taskRunner && cache) return this._taskRunner
    this._taskRunner = new TaskRunner()
    return this._taskRunner
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

  save(wrapper: ClassWrapper | ConstantWrapper): this {
    Container.map.set(wrapper.getInjectionToken(), wrapper)
    return this
  }
}
