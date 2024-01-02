import "reflect-metadata";
import { isClass } from "is-class";
import { Type } from "../typings";
import { NailyWatermark, ScopeEnum } from "../constants";
import { NailyBeanRegistry } from "../registries/naily.registry";

export class NailyBeanFactory<Instance extends Object> {
  constructor(private readonly target: Type<Instance>) {
    if (!isClass(target)) throw new TypeError(`Target ${target} is not a class`);
  }

  /**
   * 获取类的构造函数参数类型
   *
   * @author Zero <gczgroup@qq.com>
   * @date 2024/01/02
   * @template T
   * @return {*}  {T}
   * @memberof NailyBeanFactory
   */
  public getParamtypes<T extends any[]>(): T {
    return Reflect.getMetadata("design:paramtypes", this.target) || [];
  }

  /**
   * 获取类的原型键
   *
   * @author Zero <gczgroup@qq.com>
   * @date 2024/01/02
   * @return {*}  {((string | symbol)[])}
   * @memberof NailyBeanFactory
   */
  public getPrototypeKeys(): (string | symbol)[] {
    return Reflect.ownKeys(this.target.prototype) || [];
  }

  /**
   * 获取类的静态键
   *
   * @author Zero <gczgroup@qq.com>
   * @date 2024/01/02
   * @return {*}  {((string | symbol)[])}
   * @memberof NailyBeanFactory
   */
  public getStaticKeys(): (string | symbol)[] {
    return Reflect.ownKeys(this.target) || [];
  }

  /**
   * 获取Bean的元数据
   *
   * @author Zero <gczgroup@qq.com>
   * @date 2024/01/02
   * @return {*}  {(Naily.IOC.BeanOptions | undefined)}
   * @memberof NailyBeanFactory
   */
  public getBeanMetadata(): Naily.IOC.BeanOptions | undefined {
    return Reflect.getMetadata(NailyWatermark.BEAN, this.target);
  }

  public getBeanMetadataOrThrow(msg = "No bean metadata found"): Naily.IOC.BeanOptions {
    const metadata = this.getBeanMetadata();
    if (!metadata) throw new Error(msg);
    return metadata;
  }

  /**
   * 创建实例并保存到注册表 (相当于new)
   *
   * @author Zero <gczgroup@qq.com>
   * @date 2024/01/02
   * @return {*}  {Instance}
   * @memberof NailyBeanFactory
   */
  public createInstance(registerInRegistry: boolean = true): Instance {
    const metadata = this.getBeanMetadataOrThrow();

    if (metadata.Scope === ScopeEnum.SINGLETON) {
      const plainInstance = this.createPlainInstance();
      if (registerInRegistry) {
        return this.registerInstance(plainInstance);
      } else {
        return plainInstance;
      }
    } else {
      const proxyInstance = this.createProxyInstance();
      if (registerInRegistry) {
        return this.registerInstance(proxyInstance);
      } else {
        return proxyInstance;
      }
    }
  }

  /**
   * 创建实例 (相当于new)
   *
   * @author Zero <gczgroup@qq.com>
   * @date 2024/01/02
   * @return {*}  {Instance}
   * @memberof NailyBeanFactory
   */
  public createPlainInstance(): Instance {
    return new this.target(...this.transformParamtypeToParameter());
  }

  /**
   * 创建代理实例 (相当于new)
   *
   * @author Zero <gczgroup@qq.com>
   * @date 2024/01/02
   * @return {*}  {Instance}
   * @memberof NailyBeanFactory
   */
  public createProxyInstance(): Instance {
    return new Proxy(this.createPlainInstance(), {
      get: (_t, key) => {
        return this.createPlainInstance()[key];
      },
    });
  }

  /**
   * 注册实例到注册表
   *
   * @author Zero <gczgroup@qq.com>
   * @date 2024/01/02
   * @template T
   * @param {T} instance
   * @return {*}  {T}
   * @memberof NailyBeanFactory
   */
  public registerInstance<T extends Instance | undefined>(instance: T): T {
    const hasInstance = NailyBeanRegistry.get(this.target);
    if (hasInstance) return hasInstance as T;
    NailyBeanRegistry.set(this.target, instance);
    return instance;
  }

  /**
   * 将构造函数参数类型转换为参数
   *
   * @author Zero <gczgroup@qq.com>
   * @date 2024/01/02
   * @private
   * @template T
   * @return {*}  {T}
   * @memberof NailyBeanFactory
   */
  private transformParamtypeToParameter<T extends any[]>(): T {
    return this.getParamtypes().map((paramtype) => {
      if (!isClass(paramtype)) return paramtype;
      return new NailyBeanFactory(paramtype).createInstance();
    }) as T;
  }
}
