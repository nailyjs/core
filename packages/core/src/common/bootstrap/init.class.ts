import { ImplNailyPlugin, ImplNailyService, Type } from "../typings";
import { isClass } from "is-class";
import { IInjectClassMetadata, IInjectableClassMetadata } from "../typings/metadata.typing";
import { NailyContainerConstant } from "../constants";
import { NailyContainer } from "./container.class";

export class InitFactory<T extends ImplNailyService> {
  constructor(
    private readonly rootService: Type<T>,
    private readonly container: NailyContainer,
    private readonly plugins: ImplNailyPlugin[] = [],
  ) {}

  public getParams(params?: any[]): any[] {
    const paramTypes: any[] = Reflect.getMetadata("design:paramtypes", this.rootService) || [];
    if (!params) {
      params = paramTypes.map((param: unknown) => {
        if (isClass(param)) return new InitFactory(param, this.container, this.plugins).getInstance();
        return param;
      });
    }
    return params;
  }

  public getInjectableOptions(): IInjectableClassMetadata {
    return Reflect.getMetadata(NailyContainerConstant.INJECTABLE, this.rootService);
  }

  public getInjectableKeys(): IInjectClassMetadata {
    return Reflect.getMetadata(NailyContainerConstant.INJECTKEY, this.rootService) || {};
  }

  public getInstance(): T {
    // 获取构造函数参数
    const params = this.getParams();
    // 装载插件
    for (const plugin of this.plugins) {
      if (plugin.beforeCreateInjectable && typeof plugin.beforeCreateInjectable === "function") {
        plugin.beforeCreateInjectable(this.rootService, this, this.container);
      }
    }
    // 实例化类
    let result = new this.rootService(...params);
    if (!result) throw new TypeError(`Class ${this.rootService.name} is not injectable, please use @Injectable() decorator`);
    // 获取类的元数据
    const injectableOptions: IInjectableClassMetadata = this.getInjectableOptions();
    // 如果类没有元数据，抛出错误
    if (!injectableOptions) throw new Error(`Class ${this.rootService.name} is not injectable, please use @Injectable() decorator`);
    // 装载插件
    for (const plugin of this.plugins) {
      if (plugin.afterCreateInjectable && typeof plugin.afterCreateInjectable === "function") {
        result = plugin.afterCreateInjectable(this.rootService, result, this, this.container) as T;
        if (!result)
          throw new TypeError(`Class ${this.rootService.name} is not injectable, please use @Injectable() decorator`, {
            cause: `Plugin error: ${plugin.constructor.name} afterCreateInjectable return undefined or null`,
          });
      }
    }
    // 设置类的实例到容器
    this.container.setInstance(this.rootService, result);
    // 如果类有onReady方法，调用onReady方法
    if (result.onReady && typeof result.onReady === "function") result.onReady();
    return result;
  }
}
