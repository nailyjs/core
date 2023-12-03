import { createHash } from "crypto";
import { NailyWatermark, ScopeEnum } from "../constants";
import { Type } from "../typings";

function applyBean(options: NIOC.BeanMetadata, target: Type, propertyKey?: string | symbol) {
  Reflect.defineMetadata(NailyWatermark.BEAN, options, target, propertyKey);
}

export function Bean(options?: Partial<NIOC.BeanMetadata>): ClassDecorator & PropertyDecorator;
export function Bean(
  options: Partial<NIOC.BeanMetadata> = { Scope: ScopeEnum.SINGLETON, Token: createHash("md5").update(Math.random().toString()).digest("hex") },
): ClassDecorator & PropertyDecorator {
  if (!options.Scope) options.Scope = ScopeEnum.SINGLETON;
  if (!options.Token) options.Token = createHash("md5").update(Math.random().toString()).digest("hex");

  return (target: Type | Object, propertyKey?: string | symbol) => {
    if (propertyKey) {
      applyBean(options as NIOC.BeanMetadata, target.constructor as Type, propertyKey);
    } else {
      applyBean(options as NIOC.BeanMetadata, target as Type, propertyKey);
    }
  };
}
