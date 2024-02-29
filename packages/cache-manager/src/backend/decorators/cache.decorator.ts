import { Type } from "@nailyjs/core";
import { Milliseconds } from "cache-manager";
import { NailyCacheManagerConstant } from "../constants";

export type EnableCacheMethodDecorator = (
  target: Object,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>,
) => void;

/**
 * Cache TTL decorator to set the cache time to live
 *
 * @export
 * @param {Milliseconds} ttl - The time to live in milliseconds
 * @returns {EnableCacheMethodDecorator}
 */
export function EnableCache(ttl: Milliseconds = 0): EnableCacheMethodDecorator {
  return (
    target: Object | Type,
    propertyKey: string | symbol,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>,
  ) => {
    Reflect.defineMetadata(NailyCacheManagerConstant.CACHE_TTL, ttl, target, propertyKey);
  };
}
