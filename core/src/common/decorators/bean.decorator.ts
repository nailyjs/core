import { NailyWatermark, ScopeEnum } from "../constants";
import { Type } from "../typings";
import { NailyBeanFactory } from "../classes";
import md5 from "md5";

export function Bean(options?: Partial<NIOC.BeanMetadata>): ClassDecorator & PropertyDecorator;
export function Bean(
  options: Partial<NIOC.BeanMetadata> = { Scope: ScopeEnum.SINGLETON, Token: md5(Math.random.toString() + new Date().getTime().toString()) },
): ClassDecorator & PropertyDecorator {
  if (!options.Scope) options.Scope = ScopeEnum.SINGLETON;
  if (!options.Token) options.Token = md5(Math.random.toString() + new Date().getTime().toString());

  return (target: Type | Object, propertyKey?: string | symbol) => {
    if (typeof target === "object" && propertyKey) {
      Reflect.defineMetadata(NailyWatermark.BEAN, options, target.constructor);
      new NailyBeanFactory(target.constructor as Type).createInstance(true);
    } else {
      Reflect.defineMetadata(NailyWatermark.BEAN, options, target);
      new NailyBeanFactory(target as Type).createInstance(true);
    }
  };
}
