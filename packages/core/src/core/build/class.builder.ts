import "reflect-metadata";
import { n } from "@/schema/common.schema";
import { IClassDecoratorBuilderContext } from "./buildContext.builder";

export interface IClassDecoratorBuilderOptions {
  build?(this: IClassDecoratorBuilderContext, target: n.IType): void;
}

export class ClassDecoratorContext<Instance> implements IClassDecoratorBuilderContext {
  constructor(private readonly target: n.IType<Instance>) {}

  setMetadata(key: unknown, value: unknown): void {
    Reflect.defineMetadata(key, value, this.target);
  }

  getMetadata<Value>(key: unknown): Value | undefined {
    return Reflect.getMetadata(key, this.target);
  }

  getParamtypes(): unknown[] {
    return Reflect.getMetadata("design:paramtypes", this.target) || [];
  }

  getPrototypeOwnkeys(): (string | symbol)[] {
    return Reflect.ownKeys(this.target.prototype) || [];
  }

  getStaticOwnkeys(): (string | symbol)[] {
    return Reflect.ownKeys(this.target) || [];
  }
}

/**
 * ### Create Class Decorator ⁿᵃⁱ
 *
 * Create a class decorator that can be used to decorate a class.
 *
 * @export
 * @template Target - The target type.
 * @param {IClassDecoratorBuilderOptions} options - The class decorator builder options.
 */
export function createClassDecorator<Target extends Function = n.IType<any>>(options: IClassDecoratorBuilderOptions) {
  return function (target: Target) {
    if (options.build) options.build.call(new ClassDecoratorContext(target as unknown as n.IType), target);
  };
}
