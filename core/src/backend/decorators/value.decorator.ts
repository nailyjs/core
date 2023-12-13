import { NailyDecoratorFactory } from "../../common/classes/decorator.factory.js";
import { NailyBeanRegistry } from "../../common/classes/index.js";
import { NailyConfiguration } from "../vendors/index.js";

export function Value(jexl: string = "", configureOrOptional?: boolean | NIOC.Configure, configure: NIOC.Configure = new NailyConfiguration()) {
  return NailyDecoratorFactory.createPropertyDecorator({
    after(target, propertyKey) {
      target[propertyKey] = NailyBeanRegistry.jexl.evalSync(
        jexl,
        (() => {
          if (!configureOrOptional && typeof configureOrOptional === "object") {
            return configureOrOptional.getConfigure(NailyBeanRegistry.jexl as any, false);
          } else {
            if (!configure) configure = new NailyConfiguration();
            return configure.getConfigure(NailyBeanRegistry.jexl as any, typeof configureOrOptional === "boolean" ? configureOrOptional : false);
          }
        })(),
      );
    },
  });
}
