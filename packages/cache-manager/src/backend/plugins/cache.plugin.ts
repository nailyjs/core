import { INailyContainerMapValue, ImplNailyPlugin, InitFactory, NailyContainer, Type } from "@nailyjs/core";
import { NailyCacheManagerConstant } from "../constants";
import { CacheManagerService } from "../providers/cache.service";
import { randomUUID } from "crypto";

export class CacheManagerPlugin implements ImplNailyPlugin {
  preDefineCreateInjectable<T>(target: Type<T>, container: NailyContainer, pluginsContext: ImplNailyPlugin[]): INailyContainerMapValue {
    if (target === CacheManagerService) {
      return { target, instance: new InitFactory(target, container, pluginsContext).getInstance() };
    } else {
      return { target };
    }
  }

  afterCreateInjectable<T>(target: Type<T>, instance: T, factory: InitFactory<T>, container: NailyContainer): Object {
    const ownKeys = Reflect.ownKeys(target.prototype);
    for (const key of ownKeys) {
      const ttlValue = Reflect.getMetadata(NailyCacheManagerConstant.CACHE_TTL, target.prototype, key);
      if (!ttlValue) return instance;
      const originalMethod = instance[key] as Function;
      instance[key] = async function (...args: any[]) {
        const cacheKey = `${randomUUID()}:${target.name}:${key.toString()}:${JSON.stringify(args)}`;
        const instance = container.get(CacheManagerService).instance as CacheManagerService;
        if (instance) return await instance.get(cacheKey);
        return await originalMethod.apply(this, args);
      };
    }
    return instance;
  }
}
