import { NailyContainerConstant } from "../../common/constants";
import { IValueMetadata } from "../../common/typings/metadata.typing";

export function Value(jexl: string): PropertyDecorator;
export function Value(jexl: string) {
  return (target: Object, propertyKey: string | symbol) => {
    Reflect.defineMetadata(NailyContainerConstant.VALUE, { jexl, propertyKey } satisfies IValueMetadata, target, propertyKey);
    const oldMetadata: IValueMetadata[] = Reflect.getMetadata(NailyContainerConstant.VALUEKEY, target.constructor) || [];
    oldMetadata.push({ jexl, propertyKey });
    Reflect.defineMetadata(NailyContainerConstant.VALUEKEY, oldMetadata, target.constructor);
  };
}
