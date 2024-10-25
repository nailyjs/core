import type { ContainerProtocol } from './container-protocol'
import type { Filter } from './decorators/catch.decorator'
import type { InjectableOptions } from './decorators/injectable.decorator'
import type { Class, ScopeType } from './types'
import { CatchSymbol, FilterSymbol, FinallySymbol, InjectableSymbol } from './constants'
import { Container } from './container'
import { UnknownConstructorParamTypeError } from './errors'

export class InjectableWrapper<TClass extends Class = Class> extends Container implements ContainerProtocol {
  constructor(private readonly target: TClass) {
    super()
  }

  /**
   * ### Get the injectable options of the target class.
   *
   * @return {InjectableOptions}
   * @memberof InjectableWrapper
   */
  getInjectableOptions(): InjectableOptions {
    return Reflect.getMetadata(InjectableSymbol, this.target) || {}
  }

  /**
   * ### Get the catch options of the target class.
   *
   * - If the target class is not a catch class, it will return `false`.
   * - If the target class is a catch class, and multiple error types are provided, it will return an array of error types.
   * - If the target class is a catch class, and no error types are provided, it will return `true`.
   *
   * @see {@linkcode Filter} Filter decorator.
   * @return {(any[] | boolean)}
   * @memberof InjectableWrapper
   */
  getFilterOptions(): any[] | boolean {
    return Reflect.getMetadata(FilterSymbol, this.target) || false
  }

  /**
   * ### Get the method catch options of the target class.
   *
   * If the method is not a catch method, it will return `false`. Otherwise, it will return the catch options.
   *
   * @param {(string | symbol)} methodKey The method key.
   * @return {(any[] | boolean)} The method catch options.
   * @memberof InjectableWrapper
   */
  getMethodCatchOptions(methodKey: string | symbol): any[] | boolean {
    return Reflect.getMetadata(CatchSymbol, this.target, methodKey) || false
  }

  /**
   * ### Get the method finally options of the target class.
   *
   * If the method is not a finally method, it will return `false`. Otherwise, it will return the finally options.
   *
   * @param {(string | symbol)} methodKey The method key.
   * @return {(any[] | boolean)}
   * @memberof InjectableWrapper
   */
  getMethodFinallyOptions(methodKey: string | symbol): any[] | boolean {
    return Reflect.getMetadata(FinallySymbol, this.target, methodKey) || false
  }

  /**
   * ### Shortcut to {@linkcode Reflect.hasMetadata}.
   *
   * It will be define metadata in target constructor.
   *
   * @template Value Type of the metadata value.
   * @param {(string | symbol)} key The metadata key.
   * @param {Value} value The metadata value.
   * @return {this}
   * @memberof InjectableWrapper
   */
  setMetadata<Value = any>(key: string | symbol, value: Value): this {
    Reflect.defineMetadata(key, value, this.target)
    return this
  }

  /**
   * ### Shortcut to {@linkcode Reflect.getMetadata}.
   *
   * It will get metadata in target constructor.
   *
   * @template Value Type of the metadata value.
   * @param {(string | symbol)} key The metadata key.
   * @return {Value}
   * @memberof InjectableWrapper
   */
  getMetadata<Value = any>(key: string | symbol): Value {
    return Reflect.getMetadata(key, this.target)
  }

  /**
   * ### Shortcut to {@linkcode Reflect.hasMetadata}.
   *
   * It will check if the metadata key exists in the target constructor.
   *
   * @param {(string | symbol)} key The metadata key.
   * @return {boolean}
   * @memberof InjectableWrapper
   */
  hasMetadata(key: string | symbol): boolean {
    return Reflect.hasMetadata(key, this.target)
  }

  /**
   * ### Current singleton instance of the target class. If the target class is not a singleton, this will be `null`.
   *
   * @type {(InstanceType<TClass> | null)}
   * @memberof InjectableWrapper
   */
  singletonInstance: InstanceType<TClass> | null = null

  /**
   * ### Check if the target class is a singleton.
   *
   * @return {boolean}
   * @memberof InjectableWrapper
   */
  isSingleton(): boolean {
    return this.getInjectableOptions().scope === 'singleton'
  }

  /**
   * ### Check if the target class is transient.
   *
   * @return {boolean}
   * @memberof InjectableWrapper
   */
  isTransient(): boolean {
    return this.getInjectableOptions().scope === 'transient'
  }

  /**
   * ### Get the scope of the target class.
   *
   * @return {ScopeType} The scope of the target class.
   * @memberof InjectableWrapper
   */
  getScope(): ScopeType {
    return this.getInjectableOptions().scope || 'singleton'
  }

  /**
   * ### Dynamically set the {@linkcode ScopeType} of the target class.
   *
   * This method will set the scope of the target class to the new scope.
   *
   * @param {ScopeType} scope The new scope of the target class.
   * @return {this}
   * @memberof InjectableWrapper
   */
  setScope(scope: ScopeType): this {
    Reflect.defineMetadata(InjectableSymbol, { ...this.getInjectableOptions(), scope }, this.target)
    return this
  }

  /**
   * ### Get the target class.
   *
   * @return {TClass} The target class.
   * @memberof InjectableWrapper
   */
  getTarget(): TClass {
    return this.target
  }

  /**
   * ### Get the constructor parameter types of the target class.
   *
   * The `emitDecoratorMetadata` must be enabled, see [TypeScript Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html#metadata).
   * If the `emitDecoratorMetadata` is not enabled, it will return an empty array.
   *
   * @template Args Type of the constructor parameter types.
   * @return {Args} The constructor parameter types.
   * @memberof InjectableWrapper
   */
  getConstructorParamTypes<Args extends any[]>(): Args {
    return Reflect.getMetadata('design:paramtypes', this.target) || []
  }

  /**
   * ### Analyze the parameter type and resolve the parameter type to an {@linkcode InjectableWrapper}.
   *
   * @param {boolean} skipAllIfNotInjectable Skip all parameters if the parameter type is not an injectable. Default is `false`, if set to `true`, it will not throw error if the parameter type is not an injectable.
   * @return {InjectableWrapper[]} The resolved parameter types.
   * @throws {Error} If the parameter type is not an injectable and {@linkcode skipAllIfNotInjectable} is `false`.
   * @throws {UnknownConstructorParamTypeError} If the parameter type is unknown.
   * @memberof InjectableWrapper
   */
  getConstructorDependencies(skipAllIfNotInjectable: boolean = false): InjectableWrapper[] {
    const paramtypes = this.getConstructorParamTypes()

    const dependencies: InjectableWrapper[] = []

    for (const paramType of paramtypes) {
      if (typeof paramType !== 'function') throw new UnknownConstructorParamTypeError(paramType, this.target.name, paramtypes.indexOf(paramType)).logResolutions()

      const hasInjectableTarget = this.hasInjectableTarget(paramType)
      // 如果参数不是一个可注入的目标，并且设置了不跳过所有无法在容器中找到的参数，则抛出错误
      if (skipAllIfNotInjectable === false && !hasInjectableTarget) throw new Error(`Injectable ${paramType.name} not found in container.`)
      // 如果参数是一个可注入的目标，则可以直接将其添加到依赖项中
      if (hasInjectableTarget) dependencies.push(this.getInjectableTarget(paramType))
      // 如果参数不是一个可注入的目标，则创建一个新的可注入的类包装器并将其添加到依赖项中
      else {
        const newDependencies = new InjectableWrapper(paramType)
        // 获取到容器，然后将新的依赖项添加到容器中
        // 下次再次获取依赖项时，就可以直接从容器中获取
        this.getInjectableContainer().add(newDependencies)
        dependencies.push(newDependencies)
      }
    }

    return dependencies
  }

  /**
   * ### Create a raw instance of the target class.
   *
   * A shortcut to {@linkcode Reflect.construct}.
   *
   * @param {any[]} args Arguments to pass to the constructor.
   * @return {InstanceType<TClass>} The raw instance of the target class.
   * @memberof InjectableWrapper
   */
  createRawInstance(args: any[]): InstanceType<TClass> {
    return Reflect.construct(this.target, args)
  }

  /**
   * ### Create a new instance of the target class.
   *
   * Skip the scope check, and create a new instance every time.
   * - It will resolve the constructor parameters of the target class, see {@linkcode InjectableWrapper.getConstructorDependencies}.
   * - It will also create a raw instance of the target class, see {@linkcode InjectableWrapper.createRawInstance}.
   *
   * @param {boolean} skipAllIfNotInjectable Same as {@linkcode InjectableWrapper.getConstructorDependencies}, default is `false`.
   * @param {boolean} noStore Do not store the {@linkcode InjectableWrapper.singletonInstance} in the wrapper, default is `false`.
   * @return {InstanceType<TClass>}
   * @memberof InjectableWrapper
   */
  createInstance(skipAllIfNotInjectable: boolean = false, noStore: boolean = false): InstanceType<TClass> {
    const dependencies = this.getConstructorDependencies(skipAllIfNotInjectable)
    const args = dependencies.map(dependency => dependency.getOrCreateInstance())
    const rawInstance = this.createRawInstance(args)
    if (this.isSingleton() && noStore === false) this.singletonInstance = rawInstance
    return this.singletonInstance
  }

  /**
   * ### Get, or create a new instance of the target class.
   *
   * - If the target class is a singleton, it will return the singleton instance in wrapper.
   * - If the target class is a transient, it will create a new instance every time (like `new`, but we use {@linkcode Reflect.construct}).
   *
   * It will also resolve the constructor parameters of the target class, see {@linkcode InjectableWrapper.getConstructorDependencies}.
   * It will also create a raw instance of the target class, see {@linkcode InjectableWrapper.createRawInstance}.
   *
   * @param {boolean} [skipAllIfNotInjectable] Same as {@linkcode InjectableWrapper.getConstructorDependencies}, default is `false`.
   * @return {InstanceType<TClass>} The instance of the target class.
   * @throws {Error} If the parameter type is not an injectable and {@linkcode skipAllIfNotInjectable} is `false`.
   * @throws {UnknownConstructorParamTypeError} If the parameter type is unknown.
   * @memberof InjectableWrapper
   */
  getOrCreateInstance(skipAllIfNotInjectable: boolean = false): InstanceType<TClass> {
    if (this.singletonInstance !== null && this.isSingleton())
      return this.singletonInstance
    const dependencies = this.getConstructorDependencies(skipAllIfNotInjectable)
    const args = dependencies.map(dependency => dependency.getOrCreateInstance())
    const rawInstance = this.createRawInstance(args)
    if (this.isSingleton()) this.singletonInstance = rawInstance
    return this.singletonInstance
  }

  /**
   * ### Check if the target class is an injectable.
   *
   * It will check if the target class has the {@linkcode InjectableSymbol} metadata.
   *
   * @return {boolean}
   * @memberof InjectableWrapper
   */
  isInjectable(): boolean {
    return Reflect.hasMetadata(InjectableSymbol, this.target)
  }

  /**
   * ### Check if the target class is a error handler.
   *
   * It will check if the target class has the {@linkcode CatchSymbol} metadata.
   *
   * @return {boolean}
   * @memberof InjectableWrapper
   */
  isFilter(): boolean {
    return Reflect.hasMetadata(FilterSymbol, this.target)
  }

  /**
   * ### Shortcut to {@linkcode Reflect.ownKeys}.
   *
   * @return {((string | symbol)[])} The prototype keys of the target class.
   * @memberof InjectableWrapper
   */
  getPrototypeKeys(): (string | symbol)[] {
    return Reflect.ownKeys(this.target.prototype)
  }
}
