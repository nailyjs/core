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
      for (const advice of advices) {
        await advice.nailyBeforeExecute?.(target, factory, args);
      }
      const value = await originalMethod.call(target, ...args);
      for (const advice of advices) {
        await advice.nailyAfterExecute?.(target, factory, value);
      }
      return value;
    };
  };
}
