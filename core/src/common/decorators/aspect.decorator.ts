import { NailyDecoratorFactory } from "../classes/decorator.factory.js";
import { NailyBeanFactory } from "../classes/index.js";
import { NailyWatermark } from "../constants/index.js";
import { Type } from "../typings/index.js";

export function Aspect(options: Partial<NIOC.BeanMetadata> = {}) {
  return NailyDecoratorFactory.createClassDecorator({
    before() {
      return options;
    },
  });
}

export function UseAspect(...advices: NAOP.Advice[]) {
  return NailyDecoratorFactory.createMethodDecorator({
    after(target, propertyKey, descriptor) {
      Reflect.defineMetadata(NailyWatermark.ADVICE, advices, target, propertyKey);

      const originalMethod = descriptor.value;
      const factory = new NailyBeanFactory(target.constructor as Type);
      descriptor.value = async (...args: any[]) => {
        try {
          for (const advice of advices) {
            await advice.nailyBeforeExecute?.(target, factory, args);
          }
          const value = await originalMethod.call(target, ...args);
          for (const advice of advices) {
            await advice.nailyAfterExecute?.(target, factory, value);
          }
          return value;
        } catch (error) {
          for (const advice of advices) {
            await advice.nailyAfterThrowing?.(target, factory, error);
          }
        }
      };
    },
  });
}
