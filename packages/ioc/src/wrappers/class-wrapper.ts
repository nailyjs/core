import type { ContainerWrapper } from '../protocols'
import type { Class, InjectionToken, PostConstructMetadata } from '../types'
import { PostConstructWatermark } from '../constant'
import { Container } from '../container'
import { MetadataScanner } from '../metadata-scanner'
import { InjectableFactory } from './injectable-factory'

export class ClassWrapper<Instance = any> implements ContainerWrapper {
  constructor(private readonly target: Class<Instance>) {}

  wrapperType = 'class' as const

  getTarget(): Class {
    return this.target
  }

  private _metadataScanner: MetadataScanner | null = null
  /**
   * ### Get metadata scanner.
   *
   * @description Get metadata scanner for the class.
   * @param cache - if false, it will create a new instance of metadata scanner. Default is `true`.
   */
  getMetadataScanner(cache: boolean = true): MetadataScanner {
    if (this._metadataScanner && cache) return this._metadataScanner
    this._metadataScanner = new MetadataScanner(this)
    return this._metadataScanner
  }

  private _injectableFactory: InjectableFactory<Instance> | null = null
  /**
   * ### Get class factory.
   *
   * @description Get class factory for the class.
   * @param cache - if false, it will create a new instance of class factory. Default is `true`.
   */
  getClassFactory(cache: boolean = true): InjectableFactory<Instance> {
    if (this._injectableFactory && cache) return this._injectableFactory
    this._injectableFactory = new InjectableFactory(this)
    return this._injectableFactory
  }

  getInjectionToken(): InjectionToken {
    return this.getMetadataScanner()
      .getInjectableMetadata()
      .getInjectionToken()
  }

  private singletonInstance: null | Instance = null

  setSingletonInstance(instance: Instance): void {
    const taskRunner = this.getGlobalContainer().getTaskRunner()
    const tasks: PostConstructMetadata[] = this.getMetadata(PostConstructWatermark) || []
    // 这是全部一起开始执行的并行任务list
    const parallelTasks = tasks.filter(({ callType }) => callType === 'parallel')
    // 这是上一个任务执行完后下一个任务才会开始的串行任务list
    const seriesTasks = tasks.filter(({ callType }) => callType === 'series')

    // 串行任务
    taskRunner.runTasksSequentially(
      seriesTasks
        .filter(({ propertyKey }) => typeof (instance as Record<string | symbol, any>)[propertyKey] === 'function')
        .map(({ propertyKey }) => () => (instance as Record<string | symbol, any>)[propertyKey]()),
    )

    // 并行任务
    taskRunner.runTasksInParallel(
      parallelTasks
        .filter(({ propertyKey }) => typeof (instance as Record<string | symbol, any>)[propertyKey] === 'function')
        .map(({ propertyKey }) => () => (instance as Record<string | symbol, any>)[propertyKey]()),
    )

    this.singletonInstance = instance
  }

  getSingletonInstance(): Instance | null {
    return this.singletonInstance
  }

  setMetadata<Value, Key extends string | symbol = string | symbol>(key: Key, value: Value): void
  setMetadata<Value, Key extends string | symbol = string | symbol>(key: Key, value: Value): void {
    Reflect.defineMetadata(key, value, this.target)
  }

  getMetadata(key: 'design:paramtypes'): any[] | undefined
  getMetadata(key: 'design:type'): any | undefined
  getMetadata<Key extends string | symbol = string | symbol>(key: Key): any | undefined
  getMetadata<Value, Key extends string | symbol = string | symbol>(key: Key): Value | undefined {
    return Reflect.getMetadata(key, this.target)
  }

  getPropertyMetadata<Key extends string | symbol = string | symbol>(key: 'design:paramtypes', propertyKey: Key, prototype?: boolean): any[] | undefined
  getPropertyMetadata<Key extends string | symbol = string | symbol>(key: 'design:type', propertyKey: Key, prototype?: boolean): any | undefined
  getPropertyMetadata<Key extends string | symbol = string | symbol>(key: 'design:returntype', propertyKey: Key, prototype?: boolean): any | undefined
  getPropertyMetadata<Value = any, Key extends string | symbol = string | symbol>(key: Key, propertyKey: Key, prototype?: boolean): Value | undefined
  getPropertyMetadata<Value, Key extends string | symbol = string | symbol>(key: string, propertyKey: Key, prototype: boolean = false): Value | undefined {
    return Reflect.getMetadata(key, prototype === true ? this.target.prototype : this.target, propertyKey)
  }

  hasMetadata<Key extends string | symbol = string | symbol>(key: Key): boolean {
    return Reflect.hasMetadata(key, this.target)
  }

  hasPropertyMetadata<Key extends string | symbol = string | symbol>(key: Key, propertyKey: string | symbol): boolean {
    return Reflect.hasMetadata(key, this.target, propertyKey)
  }

  private _classWrapperContainer: Container | null = null
  getGlobalContainer(cache: boolean = true): Container {
    if (this._classWrapperContainer && cache) return this._classWrapperContainer
    this._classWrapperContainer = new Container()
    return this._classWrapperContainer
  }

  save(): this {
    this.getGlobalContainer().save(this)
    return this
  }
}
