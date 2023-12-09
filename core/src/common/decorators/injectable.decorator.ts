import { NailyBeanFactory, NailyBeanRegistry } from "../classes/index.js";
import { Type } from "../typings/index.js";
import { Bean } from "./bean.decorator.js";

export function Injectable(options?: Partial<NIOC.BeanMetadata>): ClassDecorator;
export function Injectable<T>(options: Partial<NIOC.BeanMetadata> = {}) {
  return (target: Type<T>) => {
    Bean(options)(target);
  };
}

export function Service(options?: Partial<NIOC.BeanMetadata>): ClassDecorator;
export function Service<T>(options: Partial<NIOC.BeanMetadata> = {}) {
  return (target: Type<T>) => {
    Bean(options)(target);
  };
}

export function Configuration(options?: Partial<NIOC.BeanMetadata>): ClassDecorator;
export function Configuration<T>(options: Partial<NIOC.BeanMetadata> = {}) {
  return (target: Type<T>) => {
    Bean(options)(target);
    const Factory = new NailyBeanFactory(target);
    const Metadata = Factory.getBeanMetadataOrThrow();
    const Element = NailyBeanRegistry.resolve(Metadata.Token);
    if (Element.instance === undefined) Factory.createInstance();
  };
}
