import { Type } from "../typings/index.js";
import { Jexl } from "jexl";

export class NailyBeanRegistry {
  protected static readonly registry: Map<string | symbol, NIOC.BeanElement> = new Map();
  public static readonly jexl = new Jexl();

  public static getRegistry() {
    return this.registry;
  }

  public static register(key: string | symbol, bean: NIOC.BeanElement) {
    this.registry.set(key, bean);
    return this;
  }

  public static resolve(key: string | symbol): NIOC.BeanElement | undefined {
    return this.registry.get(key);
  }

  public static resolveOrThrow(key: string | symbol, msg = "Cannot find element in NailyBeanRegistry"): NIOC.BeanElement {
    const element = this.resolve(key);
    if (!element) throw new Error(msg);
    return element;
  }

  public static has(key: string | symbol): boolean {
    return this.registry.has(key);
  }

  public static hasTarget<T>(target: Type<T>): false | [string | symbol, NIOC.BeanElement<T>] {
    for (const [key, value] of this.registry) {
      if (value.target === target || value.target instanceof target) {
        return [key, value];
      }
    }
    return false;
  }

  public static delete(token: string | symbol): boolean {
    return this.registry.delete(token);
  }

  public static deleteByTargetIfToken<T>(target: Type<T>, token: string | symbol): boolean {
    const hasTarget = this.hasTarget(target);
    if (!hasTarget) return false;
    const [oldToken] = hasTarget;
    if (oldToken === token) {
      return this.delete(token);
    } else {
      return false;
    }
  }

  public static clear(): void {
    this.registry.clear();
  }
}
