import isClass from "is-class";
import { NailyContainerConstant } from "..";
import { NailyContainer } from "../bootstrap/container.class";
import { InitFactory } from "../bootstrap/init.class";
import { ImplNailyInterceptPlugin, ImplNailyInterceptor, ImplNailyPlugin, ImplNailyService, Type } from "../typings";

export class InterceptMethodPlugin implements ImplNailyPlugin {
  constructor(private readonly interceptPlugins: ImplNailyInterceptPlugin[] = []) {}

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
              let interceptorBeforeArgs: any[] = [];
              for (const plugin of this.interceptPlugins) {
                if (plugin.transformBefore && typeof plugin.transformBefore === "function") {
                  interceptorBeforeArgs = await plugin.transformBefore({
                    getTarget: () => target,
                    getInstance: () => instance,
                    getArguments: () => args,
                    getMethodKey: () => key,
                  });
                }
              }
              await interceptorInstance.before(...interceptorBeforeArgs);
            }
            try {
              const value = await method.apply(instance, args);
              if (interceptorInstance.after && typeof interceptorInstance.after === "function") {
                let interceptorAfterArgs: any[] = [];
                for (const plugin of this.interceptPlugins) {
                  if (plugin.transformAfter && typeof plugin.transformAfter === "function") {
                    interceptorAfterArgs = await plugin.transformAfter({
                      getTarget: () => target,
                      getInstance: () => instance,
                      getArguments: () => args,
                      getMethodKey: () => key,
                      getReturnValue: () => value,
                    });
                  }
                }
                await interceptorInstance.after(...interceptorAfterArgs);
              }
            } catch (err) {
              if (interceptorInstance.catch && typeof interceptorInstance.catch === "function") {
                let interceptorCatchArgs: any[] = [];
                for (const plugin of this.interceptPlugins) {
                  if (plugin.transformCatch && typeof plugin.transformCatch === "function") {
                    interceptorCatchArgs = await plugin.transformCatch({
                      getTarget: () => target,
                      getInstance: () => instance,
                      getArguments: () => args,
                      getMethodKey: () => key,
                      getError: () => err,
                    });
                  }
                }
                await interceptorInstance.catch(...interceptorCatchArgs);
              }
            } finally {
              if (interceptorInstance.finally && typeof interceptorInstance.finally === "function") {
                let interceptorFinallyArgs: any[] = [];
                for (const plugin of this.interceptPlugins) {
                  if (plugin.transformFinally && typeof plugin.transformFinally === "function") {
                    interceptorFinallyArgs = await plugin.transformFinally({
                      getTarget: () => target,
                      getInstance: () => instance,
                      getArguments: () => args,
                      getMethodKey: () => key,
                    });
                  }
                }
                await interceptorInstance.finally(...interceptorFinallyArgs);
              }
            }
          };
        }
      }
    }
    return instance;
  }
}
