import { n } from "@/schema/common.schema";
import { DesignType, IParamDecoratorBuilderContext } from "./buildContext.builder";
import { PropertyDecoratorMetadata } from "./property.builder";

export interface IParamPropertyDecoratorBuilderOptions {
  build?(this: IParamDecoratorBuilderContext, target: Object | n.IType, propertyKey: string | symbol, index: number): void;
}

export interface ParamProprtyDecoratorMetadata<Value> extends PropertyDecoratorMetadata<Value> {
  value: Value;
  propertyKey: string | symbol;
  index?: number;
}

export class ParamProprtyDecoratorContext implements IParamDecoratorBuilderContext {
  constructor(
    private readonly target: Object,
    private readonly propertyKey: string | symbol,
    private readonly index?: number,
  ) {}

  setMetadata(key: unknown, value: unknown): void {
    const oldMetadata: ParamProprtyDecoratorMetadata<unknown>[] = Reflect.getMetadata(key, this.target) || [];
    oldMetadata.push({ value, propertyKey: this.propertyKey, index: this.index });
    Reflect.defineMetadata(key, oldMetadata, this.target);
  }

  getMetadata<Value>(key: unknown): ParamProprtyDecoratorMetadata<Value>[] {
    return Reflect.getMetadata(key, this.target, this.propertyKey) || [];
  }

  getMetadataByIndex<Value>(key: unknown, index: number): ParamProprtyDecoratorMetadata<Value> | undefined {
    const metadata: ParamProprtyDecoratorMetadata<Value>[] = Reflect.getMetadata(key, this.target) || [];
    return metadata.find((m) => m.index === index);
  }

  getMetadataByPropertyKey<Value>(key: unknown, propertyKey: string | symbol): ParamProprtyDecoratorMetadata<Value> | undefined {
    const metadata: ParamProprtyDecoratorMetadata<Value>[] = Reflect.getMetadata(key, this.target) || [];
    return metadata.find((m) => m.propertyKey === propertyKey);
  }

  getMetadataByIndexAndPropertyKey(key: unknown, index: number, propertyKey: string | symbol): unknown {
    const metadata: ParamProprtyDecoratorMetadata<unknown>[] = Reflect.getMetadata(key, this.target) || [];
    return metadata.find((m) => m.index === index && m.propertyKey === propertyKey);
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
 * ### Create Param or Property Decorator
 *
 * Create a param or property decorator that can be used to decorate a param or property.
 *
 * @export
 * @param {IParamPropertyDecoratorBuilderOptions} options - The param or property decorator builder options.
 */
export function createParamOrPropertyDecorator(options: IParamPropertyDecoratorBuilderOptions) {
  return function (target: Object | n.IType, propertyKey: string | symbol, index?: number) {
    if (options.build) options.build.call(new ParamProprtyDecoratorContext(target, propertyKey, index), target, propertyKey, index);
  };
}
