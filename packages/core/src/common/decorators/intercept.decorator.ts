import { NailyContainerConstant } from "..";
import { ImplNailyInterceptor, Type } from "../typings";

export function Intercept(injectableOrPlainClass?: Type<ImplNailyInterceptor> | ImplNailyInterceptor): MethodDecorator;
export function Intercept(injectableOrPlainClass?: Type<ImplNailyInterceptor> | ImplNailyInterceptor) {
  return (target: Object, propertyKey: string | symbol) => {
    const oldMetadata: any[] = Reflect.getMetadata(NailyContainerConstant.INTERCEPT, target, propertyKey) || [];
    oldMetadata.push(injectableOrPlainClass);
    Reflect.defineMetadata(NailyContainerConstant.INTERCEPT, oldMetadata, target, propertyKey);
  };
}
