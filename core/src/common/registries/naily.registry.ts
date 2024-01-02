import { Type } from "../typings";

export class NailyBeanRegistry {
  private static readonly registry = new Map<Type, undefined | Object>();

  public static set<T extends Object>(target: Type<T>, instance?: T) {
    this.registry.set(target, instance);
  }

  public static get<T extends Object>(target: Type<T>): T | undefined {
    return this.registry.get(target) as T | undefined;
  }

  public static getRegistry(): Map<Type, undefined | Object> {
    return this.registry;
  }

  public static has<T extends Object>(target: Type<T>): boolean {
    return this.registry.has(target);
  }

  public static delete<T extends Object>(target: Type<T>): boolean {
    return this.registry.delete(target);
  }

  public static clear(): void {
    this.registry.clear();
  }
}
