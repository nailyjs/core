import "reflect-metadata";
import { Type } from "../typings";
import { NailyWatermark, ScopeEnum } from "../constants";
import { NailyBeanFactory } from "../factories";

function getBeanOptions(beanOptions: Partial<Naily.IOC.BeanOptions>): Naily.IOC.BeanOptions {
  return {
    Scope: beanOptions.Scope ? beanOptions.Scope : ScopeEnum.SINGLETON,
    Rebind: typeof beanOptions.Rebind === "boolean" ? beanOptions.Rebind : true,
    Autoload: typeof beanOptions.Autoload === "boolean" ? beanOptions.Autoload : false,
  };
}

export function Bean(beanOptions?: Partial<Naily.IOC.BeanOptions>): ClassDecorator & PropertyDecorator;
export function Bean(beanOptions: Partial<Naily.IOC.BeanOptions> = {}) {
  if (!beanOptions) {
    beanOptions = {
      Scope: ScopeEnum.SINGLETON,
      Rebind: true,
      Autoload: false,
    };
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (target: Type | Object, _proertyKey?: string | symbol) => {
    const classTarget = typeof target === "function" ? (target as Type) : (target.constructor as Type);
    const oldMetadata: Naily.IOC.BeanOptions | undefined = Reflect.getMetadata(NailyWatermark.BEAN, classTarget);

    if (typeof oldMetadata !== "undefined" || typeof oldMetadata !== "object") {
      throw new Error(
        `Bean decorator metadata typing is not correct, please check ${typeof target === "object" ? target.constructor.name : (target as Type).name}`,
      );
    }

    const metadata: Naily.IOC.BeanOptions = { ...(oldMetadata ? oldMetadata : {}), ...getBeanOptions(beanOptions) };
    Reflect.defineMetadata(NailyWatermark.BEAN, metadata, classTarget);

    if (oldMetadata && (oldMetadata as Naily.IOC.BeanOptions).Rebind) {
      new NailyBeanFactory(classTarget).createInstance();
    } else {
      new NailyBeanFactory(classTarget).registerInstance(undefined);
    }
  };
}
