import { NailyBeanRegistry } from "../classes";
import { NailyConfiguration } from "../vendors";

export function Value(jexl?: string, isOptional?: boolean, configure?: NIOC.Configure): PropertyDecorator;
export function Value(jexl: string = "", configureOrOptional?: boolean | NIOC.Configure, configure: NIOC.Configure = new NailyConfiguration()) {
  return (target: Object, propertyKey: string | symbol) => {
    target[propertyKey] = NailyBeanRegistry.jexl.evalSync(
      jexl,
      (() => {
        if (typeof configureOrOptional !== "boolean") {
          return configureOrOptional.getConfigure(NailyBeanRegistry.jexl as any, false);
        } else {
          if (!configure) configure = new NailyConfiguration();
          return configure.getConfigure(NailyBeanRegistry.jexl as any, typeof configureOrOptional === "boolean" ? configureOrOptional : false);
        }
      })(),
    );
  };
}
