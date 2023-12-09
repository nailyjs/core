import { NailyWatermark, ScopeEnum } from "../constants/index.js";
import { Type } from "../typings/index.js";
import { NailyBeanFactory } from "../classes/index.js";
import md5 from "md5";

export function Bean(options?: Partial<NIOC.BeanMetadata>): ClassDecorator & PropertyDecorator;
export function Bean(options: Partial<NIOC.BeanMetadata> = {}): ClassDecorator & PropertyDecorator {
  return (target: Type | Object, propertyKey?: string | symbol) => {
    if (typeof target === "object" && propertyKey) {
      // 拿到老的元数据
      const oldMetadata: NIOC.BeanMetadata | undefined = Reflect.getMetadata(NailyWatermark.BEAN, target.constructor) || {};
      if (!oldMetadata.Scope) oldMetadata.Scope = ScopeEnum.SINGLETON;
      if (!oldMetadata.Token) oldMetadata.Token = md5(`${Math.random()}${Date.now()}`);
      if (oldMetadata.ReBind === undefined) oldMetadata.ReBind = true;
      // 判断是否不允许ReBind了，如果不允许了，那么就抛出异常
      if (!oldMetadata.ReBind && typeof options === "object" && Object.keys(options).length > 0) {
        throw new Error(
          `Cannot rebind bean, position: class ${target.constructor.name} - ${propertyKey.toString()}, because it already set ReBind to false`,
        );
      }
      // 合并元数据
      const newMetadata: NIOC.BeanMetadata = { ...oldMetadata, ...options };
      // 重新设置元数据
      Reflect.defineMetadata(NailyWatermark.BEAN, newMetadata, target.constructor);
      new NailyBeanFactory(target.constructor as Type).createInstance(true);
    } else {
      // 拿到老的元数据
      const oldMetadata: NIOC.BeanMetadata | undefined = Reflect.getMetadata(NailyWatermark.BEAN, target) || {};
      if (!oldMetadata.Scope) oldMetadata.Scope = ScopeEnum.SINGLETON;
      if (!oldMetadata.Token) oldMetadata.Token = md5(`${Math.random()}${Date.now()}`);
      if (oldMetadata.ReBind === undefined) oldMetadata.ReBind = true;
      // 判断是否不允许ReBind了，如果不允许了，那么就抛出异常
      if (!oldMetadata.ReBind && typeof options === "object" && Object.keys(options).length > 0) {
        throw new Error(`Cannot rebind bean, position: class ${(target as Type).name} - constructor, because it already set ReBind to false`);
      }
      // 合并元数据
      const newMetadata: NIOC.BeanMetadata = { ...oldMetadata, ...options };
      // 重新设置元数据
      Reflect.defineMetadata(NailyWatermark.BEAN, newMetadata, target);
      new NailyBeanFactory(target as Type).createInstance(true);
    }
  };
}
