import { NailyVueWatermark } from "../constants";

export function State() {
  return (target: Object, propertyKey: string | symbol) => {
    if (typeof target[propertyKey] === "function")
      throw new TypeError(`Cannot apply @State decorator to a method: ${target.constructor.name}.${String(propertyKey)}`);
    Reflect.defineMetadata(NailyVueWatermark.STATE, true, target, propertyKey);
  };
}
