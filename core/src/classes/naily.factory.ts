import "reflect-metadata";
import { isClass } from "is-class";
import { Type } from "../typings";
import { NailyBeanRegistry } from "./bean.registry";
import { NailyWatermark, ScopeEnum } from "../constants";

export class NailyBeanFactory<Instance extends Object> {
  constructor(private readonly target: Type<Instance>) {}

  public getParamtypes<T extends any[]>(): T {
    return Reflect.getMetadata("design:paramtypes", this.target) || [];
  }

  public getPrototypeKeys(): (string | symbol)[] {
    return Reflect.ownKeys(this.target.prototype) || [];
  }

  public getStaticKeys(): (string | symbol)[] {
    return Reflect.ownKeys(this.target) || [];
  }

  public getBeanMetadata(): NIOC.BeanMetadata | undefined {
    return Reflect.getMetadata(NailyWatermark.BEAN, this.target);
  }

  public getBeanMetadataOrThrow(msg = "No bean metadata found"): NIOC.BeanMetadata {
    const metadata = this.getBeanMetadata();
    if (!metadata) throw new Error(msg);
    return metadata;
  }

  public createInstance(registerOnly?: false, proxy?: boolean): Instance;
  public createInstance(registerOnly?: true, proxy?: boolean): undefined;
  public createInstance(registerOnly = false, proxy = true): Instance | undefined {
    const metadata = this.getBeanMetadataOrThrow();
    if (metadata.Scope === ScopeEnum.SINGLETON && NailyBeanRegistry.has(metadata.Token)) {
      const beanElement = NailyBeanRegistry.resolve(metadata.Token);
      if (beanElement.instance !== undefined) return beanElement.instance as Instance;
    }

    const instance: Instance | undefined = (() => {
      // 如果只注册，那么就不创建实例 直接返回undefined
      if (registerOnly) return undefined;
      if (metadata.Scope === ScopeEnum.SINGLETON || !proxy) {
        // 如果是单例模式，那么就直接创建实例
        return new this.target(...this.transformParamtypeToParameter());
      } else {
        // 如果不是单例模式，那么就创建一个代理对象
        return new Proxy(new this.target(...this.transformParamtypeToParameter()), {
          get: (_t, p) => {
            return new NailyBeanFactory(this.target).createInstance(registerOnly as false, false)[p];
          },
        });
      }
    })();

    NailyBeanRegistry.register(metadata.Token, { target: this.target, instance });
    return instance;
  }

  private transformParamtypeToParameter() {
    return this.getParamtypes().map((paramtype) => {
      if (!isClass(paramtype)) return paramtype;
      return new NailyBeanFactory(paramtype).createInstance();
    });
  }
}
