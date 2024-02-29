import { NailyContainer } from "../bootstrap/container.class";
import { NailyContainerConstant, ScopeEnum } from "../constants";
import { IInjectMetadata, IInjectableOptions, IToken, Type } from "../typings";
import { IInjectClassMetadata } from "../typings/metadata.typing";

/**
 * ### Naily Injectable
 *
 * This decorator is used to mark the class as an injectable class.
 *
 * @export
 * @param {Partial<IInjectableOptions>} [options]
 * @return {ClassDecorator}
 */
export function Injectable(options?: Partial<IInjectableOptions>): ClassDecorator;
export function Injectable(options: Partial<IInjectableOptions> = { scope: ScopeEnum.Singleton }) {
  return (target: Type) => {
    const paramTypes: any[] = Reflect.getMetadata("design:paramtypes", target) || [];
    if (!options.scope) options.scope = ScopeEnum.Singleton;
    Reflect.defineMetadata(
      NailyContainerConstant.INJECTABLE,
      {
        options,
        paramTypes,
      },
      target,
    );
    NailyContainer.preDefineInjectables.push({ token: options.token ?? target, target });
  };
}

/**
 * ### Naily Autowired
 *
 * This decorator is used to mark the property as an autowired property.
 *
 * @export
 * @param {IToken} [token]
 * @return {PropertyDecorator}
 */
export function Autowired(token?: IToken): PropertyDecorator;
export function Autowired(token?: IToken) {
  return (target: Object, propertyKey: string | symbol) => {
    const type = Reflect.getMetadata("design:type", target, propertyKey);
    const metadata: IInjectMetadata = { token: token || type, type };
    if (!metadata.token) {
      throw new Error(`Token is required, please provide a valid token for the injectable class ${target.constructor.name}.${String(propertyKey)}`);
    }
    const injects: IInjectClassMetadata = Reflect.getMetadata(NailyContainerConstant.INJECTKEY, target.constructor) || {};
    injects[propertyKey] = metadata;
    Reflect.defineMetadata(NailyContainerConstant.INJECTKEY, injects, target.constructor);
    Reflect.defineMetadata(NailyContainerConstant.INJECT, metadata, target, propertyKey);
  };
}
