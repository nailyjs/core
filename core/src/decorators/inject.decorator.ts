import { NailyBeanFactory } from "../classes/naily.factory";
import { NailyWatermark } from "../constants";
import { Type } from "../typings";
import { Bean } from "./bean.decorator";

export function Inject<T>(val: Type<T>, extraBeanOptions?: Partial<NIOC.BeanMetadata>) {
  return (target: Object, propertyKey: string | symbol) => {
    Bean(extraBeanOptions)(target, propertyKey);
    Reflect.defineMetadata(NailyWatermark.INJECT, val, target, propertyKey);

    Object.defineProperty(target, propertyKey, {
      get() {
        return new NailyBeanFactory(val).createInstance();
      },
    });
  };
}

export function Autowired(extraBeanOptions?: Partial<NIOC.BeanMetadata>) {
  return (target: Object, propertyKey: string | symbol) => {
    const typing = Reflect.getMetadata("design:type", target, propertyKey);
    if (!typing) throw new Error("No typing found");
    Inject(typing as Type, extraBeanOptions)(target, propertyKey);
  };
}
