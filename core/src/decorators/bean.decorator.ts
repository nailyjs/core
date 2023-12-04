import { createHash } from "crypto";
import { NailyWatermark, ScopeEnum } from "../constants";
import { Type } from "../typings";

export function Bean(options?: Partial<NIOC.BeanMetadata>): ClassDecorator & PropertyDecorator;
export function Bean(
  options: Partial<NIOC.BeanMetadata> = { Scope: ScopeEnum.SINGLETON, Token: createHash("md5").update(Math.random().toString()).digest("hex") },
): ClassDecorator & PropertyDecorator {
  if (!options.Scope) options.Scope = ScopeEnum.SINGLETON;
  if (!options.Token) options.Token = createHash("md5").update(Math.random().toString()).digest("hex");

  return (target: Type | Object, propertyKey?: string | symbol) => {
    if (typeof target === "object" && propertyKey) {
      Reflect.defineMetadata(NailyWatermark.BEAN, options, target.constructor);
    } else {
      Reflect.defineMetadata(NailyWatermark.BEAN, options, target);
    }
  };
}
