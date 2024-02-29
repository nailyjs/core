import { Type } from "@nailyjs/core";
import { NailySwaggerConstant } from "../constants";
import { isClass } from "is-class";
import { TagObject } from "../interfaces/swagger";

export function ApiTag(tag: TagObject): ClassDecorator & MethodDecorator;
export function ApiTag(tag: string): ClassDecorator & MethodDecorator;
export function ApiTag(tag: TagObject | string): ClassDecorator & MethodDecorator {
  return (target: Type | Object, propertyKey?: string | symbol) => {
    if (typeof target === "object" && propertyKey) {
      const tags: TagObject[] = Reflect.getMetadata(NailySwaggerConstant.API_TAG, target, propertyKey) || [];
      if (!tags.some((t) => t.name === tag) && typeof tag === "object") tags.push(tag);
      if (!tags.some((t) => t.name === tag) && typeof tag === "string") tags.push({ name: tag });
      Reflect.defineMetadata(NailySwaggerConstant.API_TAG, tags, target, propertyKey);
    } else if (isClass(target) && !propertyKey) {
      const keys = Reflect.ownKeys(target.prototype);
      for (const key of keys) {
        const tags: TagObject[] = Reflect.getMetadata(NailySwaggerConstant.API_TAG, target.prototype, key) || [];
        if (!tags.some((t) => t.name === tag) && typeof tag === "object") tags.push(tag);
        if (!tags.some((t) => t.name === tag) && typeof tag === "string") tags.push({ name: tag });
        Reflect.defineMetadata(NailySwaggerConstant.API_TAG, tags, target.prototype, key);
      }
    }
  };
}
