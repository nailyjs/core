import { DesignType, IPropertyDecoratorBuilderContext } from "./buildContext.builder";

export interface IPropertyDecoratorBuilderOptions {
  build?(this: IPropertyDecoratorBuilderContext, target: Object, propertyKey: string | symbol): void;
}

export interface PropertyDecoratorMetadata<Value> {
  value: Value;
  propertyKey: string | symbol;
}

export class PropertyDecoratorContext implements IPropertyDecoratorBuilderContext {
  constructor(
    private readonly target: Object,
    private readonly propertyKey: string | symbol,
  ) {}

  setMetadata(key: unknown, value: unknown): void {
    const oldMetadata: PropertyDecoratorMetadata<unknown>[] = Reflect.getMetadata(key, this.target) || [];
    oldMetadata.push({ value, propertyKey: this.propertyKey });
    Reflect.defineMetadata(key, oldMetadata, this.target);
  }

  getMetadata<Value>(key: unknown): PropertyDecoratorMetadata<Value>[] {
    return Reflect.getMetadata(key, this.target, this.propertyKey) || [];
  }

  getPrototypeOwnkeys(): (string | symbol)[] {
    return Reflect.ownKeys(this.target) || [];
  }

  getStaticOwnkeys(): (string | symbol)[] {
    return Reflect.ownKeys(this.target.constructor) || [];
  }

  getDesignType(): DesignType {
    return Reflect.getMetadata("design:type", this.target, this.propertyKey);
  }
}

/**
 * ### Create Property Decorator
 *
 * Create a property decorator that can be used to decorate a property.
 *
 * @export
 * @param {IPropertyDecoratorBuilderOptions} options - The property decorator builder options.
 */
export function createPropertyDecorator(options: IPropertyDecoratorBuilderOptions) {
  return function (target: Object, propertyKey: string | symbol) {
    if (options.build) options.build.call(new PropertyDecoratorContext(target, propertyKey), target, propertyKey);
  };
}
