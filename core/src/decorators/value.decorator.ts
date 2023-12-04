import { NailyBeanRegistry } from "../classes";
import { NailyConfiguration } from "../vendors";

export function Value(jexl: string = "", configure: NIOC.Configure = new NailyConfiguration()) {
  return (target: Object, propertyKey: string | symbol) => {
    const value = NailyBeanRegistry.jexl.evalSync(jexl, configure.getConfigure(NailyBeanRegistry.jexl as any));
    target[propertyKey] = value;
  };
}
