export class NailyBeanRegistry {
  protected static readonly registry: Map<string | symbol, NIOC.BeanElement> = new Map();

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

  public static clear(): void {
    this.registry.clear();
  }
}
