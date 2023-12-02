import { NailyFactory } from "../classes";
import { Type } from "../typings";

export function Inject<T>(val: Type<T>) {
  return (target: Object, propertyKey: string | symbol) => {
    target[propertyKey] = new NailyFactory(val).createInstance();
  };
}

export function Autowired(target: Object, propertyKey: string | symbol) {
  const typing = Reflect.getMetadata("design:type", target, propertyKey);
  if (!typing) throw new Error(`Cannot get type of property ${propertyKey.toString()}`);
  Inject(typing)(target, propertyKey);
}
