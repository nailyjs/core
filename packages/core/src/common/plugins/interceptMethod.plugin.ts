import isClass from "is-class";
import { NailyContainerConstant } from "..";
import { NailyContainer } from "../bootstrap/container.class";
import { InitFactory } from "../bootstrap/init.class";
import { ImplNailyInterceptor, ImplNailyPlugin, ImplNailyService, Type } from "../typings";

export class InterceptMethodPlugin implements ImplNailyPlugin {
  afterCreateInjectable<T>(target: Type<T>, instance: T, factory: InitFactory<T>, container: NailyContainer): Object {
    const methodKeys = Reflect.ownKeys(target.prototype).filter((key) => key !== "constructor");
    for (const key of methodKeys) {
      const interceptors: Type<ImplNailyInterceptor> | ImplNailyInterceptor = Reflect.getMetadata(
        NailyContainerConstant.INTERCEPT,
        target.prototype,
        key,
      );
      if (!interceptors) continue;
      if (!Array.isArray(interceptors)) continue;
      for (const i in interceptors) {
        const interceptor = interceptors[i] as Type<ImplNailyInterceptor> | ImplNailyInterceptor;
        if (isClass(interceptor)) {
          const factory = new InitFactory<ImplNailyService & ImplNailyInterceptor>(interceptor, container);
          const interceptorInstance = factory.getInstance();
          const method = instance[key];
          instance[key] = async (...args: any[]) => {
            if (interceptorInstance.before && typeof interceptorInstance.before === "function") {
              interceptorInstance.before(...args);
            }
            try {
              const value = await method.apply(instance, args);
              if (interceptorInstance.after && typeof interceptorInstance.after === "function") {
                interceptorInstance.after(value);
              }
            } catch (err) {
              if (interceptorInstance.catch && typeof interceptorInstance.catch === "function") {
                interceptorInstance.catch(err);
              }
            } finally {
              if (interceptorInstance.finally && typeof interceptorInstance.finally === "function") {
                interceptorInstance.finally();
              }
            }
          };
        }
      }
    }
    return instance;
  }
}
