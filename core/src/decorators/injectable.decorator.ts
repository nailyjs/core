import { NailyFactory } from "../classes";
import { Type } from "../typings";
import { Bean } from "./bean.decorator";

export function Injectable(options?: Partial<NIOC.Metadata.ClassBean>): ClassDecorator;
export function Injectable<T>(options: Partial<NIOC.Metadata.ClassBean> = {}) {
  return (target: Type<T>) => {
    Bean(options)(target);
  };
}

export function Service(options?: Partial<NIOC.Metadata.ClassBean>): ClassDecorator;
export function Service<T>(options: Partial<NIOC.Metadata.ClassBean> = {}) {
  return (target: Type<T>) => {
    Bean(options)(target);
  };
}

export function Configuration(options?: Partial<NIOC.Metadata.ClassBean>): ClassDecorator;
export function Configuration<T>(options: Partial<NIOC.Metadata.ClassBean> = {}) {
  return (target: Type<T>) => {
    Bean(options)(target);
    target.prototype = new NailyFactory(target).createInstance();
  };
}
