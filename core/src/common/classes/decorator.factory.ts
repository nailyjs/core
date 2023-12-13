import { Bean } from "../decorators";
import { Type } from "../typings";

export namespace NailyDecoratorFactory {
  export interface PropertyDecoratorFactory {
    before?(target: Object, propertyKey: string | symbol): Partial<NIOC.BeanMetadata>;
    after?(target: Object, propertyKey: string | symbol, options: Partial<NIOC.BeanMetadata>): void;
  }

  export interface ClassDecoratorFactory {
    before?<Instance>(target: Type<Instance>): Partial<NIOC.BeanMetadata>;
    after?<Instance>(target: Type<Instance>, options: Partial<NIOC.BeanMetadata>): void;
  }

  export interface MethodDecoratorFactory {
    before?(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<(...args: any[]) => any>): Partial<NIOC.BeanMetadata>;
    after?(
      target: Object,
      propertyKey: string | symbol,
      descriptor: TypedPropertyDescriptor<(...args: any[]) => any>,
      options: Partial<NIOC.BeanMetadata>,
    ): void;
  }
}

export class NailyDecoratorFactory {
  public static applyDecorators(...decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator>) {
    return <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => {
      for (const decorator of decorators) {
        if (target instanceof Function && !descriptor) {
          (decorator as ClassDecorator)(target);
          continue;
        }
        (decorator as MethodDecorator | PropertyDecorator)(target, propertyKey, descriptor);
      }
    };
  }

  public static applyClassDecorators(...decorators: Array<ClassDecorator>): ClassDecorator {
    return <TFunction extends Function>(target: TFunction) => {
      for (const decorator of decorators) {
        (decorator as ClassDecorator)(target);
      }
    };
  }

  public static applyMethodDecorators(...decorators: Array<MethodDecorator>): MethodDecorator {
    return <TFunction extends Function>(target: TFunction, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
      for (const decorator of decorators) {
        (decorator as MethodDecorator)(target, propertyKey, descriptor);
      }
    };
  }

  public static applyPropertyDecorators(...decorators: Array<PropertyDecorator>): PropertyDecorator {
    return <TFunction extends Function>(target: TFunction, propertyKey: string | symbol) => {
      for (const decorator of decorators) {
        (decorator as PropertyDecorator)(target, propertyKey);
      }
    };
  }

  public static applyParameterDecorators(...decorators: Array<ParameterDecorator>): ParameterDecorator {
    return <TFunction extends Function>(target: TFunction, propertyKey: string | symbol, parameterIndex: number) => {
      for (const decorator of decorators) {
        (decorator as ParameterDecorator)(target, propertyKey, parameterIndex);
      }
    };
  }

  public static createPropertyDecorator(factory?: NailyDecoratorFactory.PropertyDecoratorFactory): PropertyDecorator;
  public static createPropertyDecorator(factory: Partial<NailyDecoratorFactory.PropertyDecoratorFactory> = {}) {
    return (target: Object, propertyKey: string | symbol) => {
      const options = factory.before ? factory.before(target, propertyKey) : {};
      Bean(options)(target, propertyKey);
      factory.after ? factory.after(target, propertyKey, options) : undefined;
    };
  }

  public static createClassDecorator(factory?: NailyDecoratorFactory.ClassDecoratorFactory): ClassDecorator;
  public static createClassDecorator(factory: Partial<NailyDecoratorFactory.ClassDecoratorFactory> = {}) {
    return (target: Type) => {
      const options = factory.before ? factory.before(target) : {};
      Bean(options)(target);
      factory.after ? factory.after(target, options) : undefined;
    };
  }

  public static createMethodDecorator(factory?: NailyDecoratorFactory.MethodDecoratorFactory): MethodDecorator;
  public static createMethodDecorator(factory: Partial<NailyDecoratorFactory.MethodDecoratorFactory> = {}) {
    return (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<(...args: any[]) => any>) => {
      const options = factory.before ? factory.before(target, propertyKey, descriptor) : {};
      Bean(options)(target, propertyKey);
      factory.after ? factory.after(target, propertyKey, descriptor, options) : undefined;
    };
  }
}
