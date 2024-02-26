import { ImplNailyPlugin, Type } from "../typings";
import { NailyContainer } from "../bootstrap/container.class";
import { InitFactory } from "../bootstrap/init.class";
import { ScopeEnum } from "..";
import { IInjectClassMetadata } from "../typings/metadata.typing";

export class InjectPropertyPlugin implements ImplNailyPlugin {
  afterCreateInjectable<T>(target: Type<T>, instance: T, factory: InitFactory<T>, container: NailyContainer): Object {
    // 获取类的注入属性
    const keys: IInjectClassMetadata = factory.getInjectableKeys();
    // 遍历注入属性
    for (const key in keys) {
      // 单个属性的元数据
      const metadata = keys[key];
      // 根据token获取属性的值
      const value = container.get(metadata.token);
      // 如果属性没有值，抛出错误
      if (!value) throw new Error(`Class ${target.name} has no injectable instance for key ${key}`);
      // 拿到属性类的工厂类
      const factory = new InitFactory(value.target, container);
      // 获取属性类的元数据
      const options = factory.getInjectableOptions();
      // 如果属性类的Scope是Singleton
      if (options.options.scope === ScopeEnum.Singleton) {
        // 如果属性类没有实例化，直接实例化属性类
        if (!value.instance) {
          const instance = factory.getInstance();
          container.setInstance(metadata.token, instance);
        }
        // 设置属性为只读
        Object.defineProperty(instance, key, {
          value: value.instance,
          writable: false,
        });
      } else if (options.options.scope === ScopeEnum.Transient) {
        // 如果属性类的Scope是Transient 使用getter 每次获取属性都会实例化一次类
        Object.defineProperty(instance, key, {
          get: () => {
            if (value.instance) return value.instance;
            return new InitFactory(value.target, container).getInstance();
          },
          // 设置属性为只读
          set() {
            throw new Error(`Property ${key} is readonly`);
          },
        });
      }
    }
    return instance;
  }
}
