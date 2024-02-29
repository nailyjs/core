import isClass from "is-class";
import { NailyContainerConstant } from "../constants";
import { ImplNailyInterceptor, Type } from "../typings";
import { IInterceptParamMetadata, IInterceptParamMetadataType } from "../typings/metadata.typing";

/**
 * ### Naily Intercept
 *
 * This decorator is used to mark the interceptor of the method.
 *
 * @export
 * @param {(Type<ImplNailyInterceptor> | ImplNailyInterceptor)} [injectableOrPlainClass] - The interceptor class or instance.
 * @return {(ClassDecorator & MethodDecorator)}
 */
export function Intercept(injectableOrPlainClass?: Type<ImplNailyInterceptor> | ImplNailyInterceptor): ClassDecorator & MethodDecorator;
export function Intercept(injectableOrPlainClass?: Type<ImplNailyInterceptor> | ImplNailyInterceptor) {
  return (target: Object | Type, propertyKey: string | symbol) => {
    if (propertyKey) {
      const oldMetadata: (Type<ImplNailyInterceptor> | ImplNailyInterceptor)[] =
        Reflect.getMetadata(NailyContainerConstant.INTERCEPT, target, propertyKey) || [];
      oldMetadata.push(injectableOrPlainClass);
      Reflect.defineMetadata(NailyContainerConstant.INTERCEPT, oldMetadata, target, propertyKey);
    } else if (isClass(target) && !propertyKey) {
      const methodKeys = Reflect.ownKeys(target.prototype).filter((key) => key !== "constructor");
      for (const item of methodKeys) {
        const oldMetadata: (Type<ImplNailyInterceptor> | ImplNailyInterceptor)[] =
          Reflect.getMetadata(NailyContainerConstant.INTERCEPT, target.prototype, item) || [];
        oldMetadata.push(injectableOrPlainClass);
        Reflect.defineMetadata(NailyContainerConstant.INTERCEPT, oldMetadata, target.prototype, item);
      }
    }
  };
}

/**
 * ### Naily Intercept CatchedError
 *
 * This decorator is used to mark the parameter of the `catch` method in the interceptor.
 *
 * @export
 * @return {ParameterDecorator}
 */
export function CatchedError(): ParameterDecorator {
  return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
    const oldMetadata: IInterceptParamMetadata[] = Reflect.getMetadata(NailyContainerConstant.INTERCEPT_PARAMETER, target, propertyKey) || [];
    oldMetadata[parameterIndex] = { type: IInterceptParamMetadataType.CatchedError };
    Reflect.defineMetadata(NailyContainerConstant.INTERCEPT_PARAMETER, oldMetadata, target, propertyKey);
  };
}

/**
 * ### Naily Intercept Parameter
 *
 * This decorator is used to mark the parameter of the `before`, `after`, and `finally` methods in the interceptor.
 *
 * It will collect the method parameters of the interceptor to a array and pass it to the interceptor method.
 *
 * @export
 * @return {ParameterDecorator}
 */
export function Parameter(): ParameterDecorator {
  return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
    const oldMetadata: IInterceptParamMetadata[] = Reflect.getMetadata(NailyContainerConstant.INTERCEPT_PARAMETER, target, propertyKey) || [];
    oldMetadata[parameterIndex] = { type: IInterceptParamMetadataType.Parameter };
    Reflect.defineMetadata(NailyContainerConstant.INTERCEPT_PARAMETER, oldMetadata, target, propertyKey);
  };
}
