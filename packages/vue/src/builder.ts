import { NailyBeanFactory, type Type } from "@nailyjs/core";
import { createApp, defineComponent, type ComponentPublicInstance } from "vue";
import { NailyVueWatermark } from "./constants";
import { NailyVueBuilder } from "./typings";

export const Vue = class {} as Type<ComponentPublicInstance & NailyVueBuilder>;
export function transformClassApp<Instance extends Object>(rootComponent: Type<Instance>) {
  const ClassFactory = new NailyBeanFactory(rootComponent);
  const instance = ClassFactory.createInstance();
  const ownKeys = [
    ...ClassFactory.getPrototypeKeys().filter((key) => key !== "constructor"),
    ...Reflect.ownKeys(instance).filter((key) => key !== "constructor"),
  ];

  const data = {};
  for (const key of ownKeys) {
    const isState = Reflect.getMetadata(NailyVueWatermark.STATE, rootComponent.prototype, key);
    console.log(key);
    if (isState) data[key] = instance[key];
  }

  const methods = {};
  for (const key of ownKeys) {
    if (typeof rootComponent.prototype[key] !== "function") continue;
    methods[key] = rootComponent.prototype[key];
  }

  const component = defineComponent({
    data() {
      return data;
    },
    methods: methods,
    render: rootComponent.prototype.build as Function,
  });

  return component;
}

export function createClassApp<Instance>(rootComponent: Type<Instance>) {
  const transformed = transformClassApp(rootComponent);
  return createApp(transformed);
}
