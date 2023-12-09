import { NailyDecoratorFactory } from "../classes/decorator.factory.js";
import { NailyBeanFactory, NailyBeanRegistry } from "../classes/index.js";

export function Injectable(options?: Partial<NIOC.BeanMetadata>): ClassDecorator;
export function Injectable(options: Partial<NIOC.BeanMetadata> = {}) {
  return NailyDecoratorFactory.createClassDecorator({
    before() {
      return options;
    },
  });
}

export function Service(options?: Partial<NIOC.BeanMetadata>): ClassDecorator;
export function Service(options: Partial<NIOC.BeanMetadata> = {}) {
  return NailyDecoratorFactory.createClassDecorator({
    before() {
      return options;
    },
  });
}

export function Configuration(options?: Partial<NIOC.BeanMetadata>): ClassDecorator;
export function Configuration(options: Partial<NIOC.BeanMetadata> = {}) {
  return NailyDecoratorFactory.createClassDecorator({
    before() {
      return options;
    },
    after(target) {
      const Factory = new NailyBeanFactory(target);
      const Metadata = Factory.getBeanMetadataOrThrow();
      const Element = NailyBeanRegistry.resolve(Metadata.Token);
      if (Element.instance === undefined) Factory.createInstance();
    },
  });
}
