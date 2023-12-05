import { NailyBeanFactory, NailyBeanRegistry } from "@nailyjs/core";
import { NailyBackendWatermark } from "../constants";

export interface INailyControllerRegistry {
  controllerMetadata: NBackend.ControllerMetadata;
  methods: Record<string | symbol, NBackend.MethodMetadata[]>;
}

export class NailyControllerRegistry {
  public static getMapper() {
    const allValues = NailyBeanRegistry.getRegistry().values();
    const results: INailyControllerRegistry[] = [];

    Mapper: for (const item of allValues) {
      const controllerMetadata: NBackend.ControllerMetadata | undefined = Reflect.getMetadata(NailyBackendWatermark.CONTROLLER, item.target);
      if (!controllerMetadata) continue Mapper;
      const methods: Record<string | symbol, NBackend.MethodMetadata[]> = {};
      const BeanFactory = new NailyBeanFactory(item.target);
      const ownKeys = BeanFactory.getPrototypeKeys().filter((key) => (key === "constructor" ? undefined : key));

      Property: for (const propertyKey of ownKeys) {
        const propertyMethods: NBackend.MethodMetadata[] = Reflect.getMetadata(NailyBackendWatermark.METHOD, item.target.prototype, propertyKey);
        if (!methods) continue Property;
        methods[propertyKey] = propertyMethods;
      }

      results.push({ controllerMetadata, methods });
    }

    return results;
  }
}
