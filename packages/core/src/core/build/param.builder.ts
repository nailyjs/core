import { n } from "@/schema/common.schema";
import { DesignType, IParamDecoratorBuilderContext } from "./buildContext.builder";
import { PropertyDecoratorMetadata } from "./property.builder";

export interface IParamDecoratorBuilderOptions {
  build?(this: IParamDecoratorBuilderContext, target: Object | n.IType, propertyKey: string | symbol, index: number): void;
}

export interface ParamDecoratorMetadata<Value> extends PropertyDecoratorMetadata<Value> {
  value: Value;
  propertyKey: string | symbol;
  index: number;
}

export class ParamDecoratorContext implements IParamDecoratorBuilderContext {
  constructor(
    private readonly target: Object,
    private readonly propertyKey: string | symbol,
    private readonly index: number,
  ) {}

  setMetadata(key: unknown, value: unknown): void {
    const oldMetadata: ParamDecoratorMetadata<unknown>[] = Reflect.getMetadata(key, this.target) || [];
    oldMetadata.push({ value, propertyKey: this.propertyKey, index: this.index });
    Reflect.defineMetadata(key, oldMetadata, this.target);
  }

  getMetadata<Value>(key: unknown): ParamDecoratorMetadata<Value>[] {
    return Reflect.getMetadata(key, this.target, this.propertyKey) || [];
  }

  getMetadataByIndex<Value>(key: unknown, index: number): ParamDecoratorMetadata<Value> | undefined {
    const metadata: ParamDecoratorMetadata<Value>[] = Reflect.getMetadata(key, this.target) || [];
    return metadata.find((m) => m.index === index);
  }

  getMetadataByPropertyKey<Value>(key: unknown, propertyKey: string | symbol): ParamDecoratorMetadata<Value> | undefined {
    const metadata: ParamDecoratorMetadata<Value>[] = Reflect.getMetadata(key, this.target) || [];
    return metadata.find((m) => m.propertyKey === propertyKey);
  }

  getMetadataByIndexAndPropertyKey(key: unknown, index: number, propertyKey: string | symbol): unknown {
    const metadata: ParamDecoratorMetadata<unknown>[] = Reflect.getMetadata(key, this.target) || [];
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
 * ### Param Decorator Builder
 *
 * Create a param decorator builder that can be used to create a param decorator.
 *
 * @export
 * @param {IPropertyDecoratorBuilderOptions} options - Options for the param decorator builder.
 */
export function createParamDecorator(options: IParamDecoratorBuilderOptions) {
  return function (target: Object | n.IType, propertyKey: string | symbol, index: number) {
    if (options.build) options.build.call(new ParamDecoratorContext(target, propertyKey, index), target, propertyKey, index);
  };
}
