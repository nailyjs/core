import "reflect-metadata";
import { Type } from "../typings";
import { generateToken } from "../typings/generator";
import { NailyWatermark, ScopeOptions } from "../constants";

function applyBean(options: Partial<NIOC.Metadata.Bean>, target: Type) {
  const oldMetadata: undefined | NIOC.Metadata.Bean = Reflect.getMetadata(NailyWatermark.BEAN, target);
  if (!oldMetadata) {
    Reflect.defineMetadata(NailyWatermark.BEAN, options, target);
  } else if (options.ReBind) {
    Reflect.defineMetadata(NailyWatermark.BEAN, { ...oldMetadata, ...options }, target);
  }
}

export function Bean(options?: Partial<NIOC.Metadata.PropertyBean>): PropertyDecorator & ClassDecorator;
export function Bean(options: Partial<NIOC.Metadata.PropertyBean> = {}) {
  return (target: Type | Object, propertyKey: string | symbol) => {
    if (!options.Token) options.Token = generateToken();
    if (!options.Scope) options.Scope = ScopeOptions.Singleton;
    if (!options.ReBind) {
      if (typeof target === "function") {
        options.ReBind = true;
      } else if (typeof target === "object") {
        options.ReBind = false;
      }
    }

    if (typeof target === "function") {
      applyBean(options, target as Type);
    } else if (typeof target === "object" && (typeof propertyKey === "string" || typeof propertyKey === "symbol")) {
      applyBean(options, target.constructor as Type);
    }
  };
}
