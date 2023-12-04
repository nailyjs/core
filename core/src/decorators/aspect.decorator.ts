import { NailyBeanFactory } from "../classes";
import { NailyWatermark } from "../constants";
import { Type } from "../typings";
import { Bean } from "./bean.decorator";

export function Aspect(options?: Partial<NIOC.BeanMetadata>): ClassDecorator;
export function Aspect<T>(options: Partial<NIOC.BeanMetadata> = {}) {
  return (target: Type<T>) => {
    Bean(options)(target);
  };
}

export function UseAspect(...advices: NAOP.Advice[]) {
  return (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<(...args: any[]) => any>) => {
    Reflect.defineMetadata(NailyWatermark.ADVICE, advices, target, propertyKey);

    const originalMethod = descriptor.value;
    const factory = new NailyBeanFactory(target.constructor as Type);
    descriptor.value = async (...args: any[]) => {
      advices.forEach((advice) => {
        advice.nailyBeforeExecute?.(target, factory, args);
      });
      const value = await originalMethod.call(target, ...args);
      advices.forEach((advice) => {
        advice.nailyAfterExecute?.(target, factory, value);
      });
      return value;
    };
  };
}
