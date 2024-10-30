import type { InjectableWrapper } from '@nailyjs/ioc'
import { Container, Injectable } from '@nailyjs/ioc'
import { RestControllerSymbol } from './constant'

@Injectable()
export class BackendContainer extends Container {
  private isCatchError(errors: any[] | boolean, comparisonError: unknown): boolean {
    if (typeof errors === 'boolean') return errors
    if (!errors || !Array.isArray(errors)) return false
    return errors.some((error) => {
      if (comparisonError === error) return true
      if (typeof comparisonError === 'object' && comparisonError instanceof error) return true
      return false
    })
  }

  /**
   * ### Iterate over the error handlers.
   *
   * This method will iterate over the error handlers and call the callback function.
   * The callback function should accept three arguments: `target`, `methodKey`, and `wrapper`.
   * - `target` is the target `instance`(like {@linkcode InjectableWrapper.singletonInstance}),
   *   it is the instance of the class constructor.
   * - `methodKey` is the current method key, it is the key of the method.
   * - `wrapper` is the current class wrapper, it is the instance of the {@linkcode InjectableWrapper}.
   *
   * It will iterate if the class/class method is `instanceof` the error class. A error handler class example:
   * ```typescript
   * Filter(MyError)
   * class MyErrorHandler {
   *  Catch()
   *  handle() {}
   * }
   * ```
   * It will execute when throw a `MyError` error.
   *
   * @param {((target: Record<string, any>, methodKey: string | symbol, wrapper: InjectableWrapper) => any)} callback The callback function.
   * @param {unknown} error The error object.
   * @return {Promise<this>}
   * @memberof BackendContainer
   */
  async eachErrorHandler(callback: (target: Record<string | symbol, any>, methodKey: string | symbol, wrapper: InjectableWrapper) => any, error: unknown): Promise<this> {
    const container = this.getInjectableContainer()

    for (const wrapper of container) {
      if (!wrapper.isFilter()) continue
      const catchOptions = wrapper.getFilterOptions()
      if (!this.isCatchError(catchOptions, error)) continue

      const methodKeys = wrapper.getPrototypeKeys().filter(key => key !== 'constructor')
      const instance = wrapper.getOrCreateInstance()

      for (let i = 0; i < methodKeys.length; i++) {
        if (typeof instance[methodKeys[i]] !== 'function') continue
        const errors = wrapper.getMethodCatchOptions(methodKeys[i])
        if (this.isCatchError(errors, error)) {
          await callback(instance, methodKeys[i], wrapper)
          return this
        }
      }
    }

    return this
  }

  /**
   * ### Iterate over the finally handlers.
   *
   * This method will iterate over the finally handlers and call the callback function.
   * The callback function should accept three arguments: `target`, `methodKey`, and `wrapper`.
   * - `target` is the target `instance`(like {@linkcode InjectableWrapper.singletonInstance}),
   *  it is the instance of the class constructor or the instance of the class.
   * - `methodKey` is the current method key, it is the key of the method. It is the method key of the class.
   * - `wrapper` is the current class wrapper, it is the instance of the {@linkcode InjectableWrapper}.
   *
   * It will iterate if the class/class method is `instanceof` the error class. A error handler class example:
   * ```typescript
   * Filter(MyError)
   * class MyErrorHandler {
   *   Finally()
   *   handle() {}
   * }
   * ```
   *
   * It will execute when throw a `MyError` error.
   *
   * @param {((target: Record<string | symbol, any>, methodKey: string | symbol, wrapper: InjectableWrapper) => any)} callback The callback function.
   * @param {unknown} error The error object.
   * @return {Promise<this>}
   * @memberof BackendContainer
   */
  async eachFinallyHandler(callback: (target: Record<string | symbol, any>, methodKey: string | symbol, wrapper: InjectableWrapper) => any, error: unknown): Promise<this> {
    const container = this.getInjectableContainer()

    for (const wrapper of container) {
      if (!wrapper.isFilter()) continue
      const finallyOptions = wrapper.getFilterOptions()
      if (!finallyOptions) continue

      const methodKeys = wrapper.getPrototypeKeys().filter(key => key !== 'constructor')
      const instance = wrapper.getOrCreateInstance()
      for (let i = 0; i < methodKeys.length; i++) {
        if (typeof instance[methodKeys[i]] !== 'function') continue
        const errors = wrapper.getMethodFinallyOptions(methodKeys[i])
        if (this.isCatchError(errors, error)) {
          await callback(instance, methodKeys[i], wrapper)
          return this
        }
      }
    }

    return this
  }

  wrapperIsController(wrapper: InjectableWrapper): boolean {
    return !wrapper.isFilter()
      && wrapper.isInjectable()
      && Reflect.hasMetadata(RestControllerSymbol, wrapper.getTarget())
  }
}
