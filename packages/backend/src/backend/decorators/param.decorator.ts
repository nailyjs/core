import { INailyParameter, INailyParameterMetadata, ImplNailyBackendPipe } from "../typings";
import { NailyBackendConstant } from "../constants";
import { Type } from "@nailyjs/core";

/**
 * The `Params` decorator is used to inject the request parameters into the controller method.
 *
 * @export
 * @return {ParameterDecorator}
 */
export function Params(...pipes: (ImplNailyBackendPipe | Type<ImplNailyBackendPipe>)[]): ParameterDecorator {
  return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
    const parameterTypes: any[] = Reflect.getMetadata("design:paramtypes", target, propertyKey) || [];
    const parameterType = parameterTypes[parameterIndex] || undefined;

    const oldParameterMetadata: INailyParameterMetadata[] = Reflect.getMetadata(NailyBackendConstant.PARAMETER, target, propertyKey) || [];
    oldParameterMetadata[parameterIndex] = {
      type: INailyParameter.Params,
      designType: parameterType,
      pipes,
    };
    Reflect.defineMetadata(NailyBackendConstant.PARAMETER, oldParameterMetadata, target, propertyKey);
  };
}

/**
 * The `Query` decorator is used to inject the request query into the controller method.
 *
 * @export
 * @return {ParameterDecorator}
 */
export function Query(...pipes: (ImplNailyBackendPipe | Type<ImplNailyBackendPipe>)[]): ParameterDecorator {
  return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
    const parameterTypes: any[] = Reflect.getMetadata("design:paramtypes", target, propertyKey) || [];
    const parameterType = parameterTypes[parameterIndex] || undefined;

    const oldParameterMetadata: INailyParameterMetadata[] = Reflect.getMetadata(NailyBackendConstant.PARAMETER, target, propertyKey) || [];
    oldParameterMetadata[parameterIndex] = {
      type: INailyParameter.Query,
      designType: parameterType,
      pipes,
    };
    Reflect.defineMetadata(NailyBackendConstant.PARAMETER, oldParameterMetadata, target, propertyKey);
  };
}

/**
 * The `Body` decorator is used to inject the request body into the controller method.
 *
 * @export
 * @return {ParameterDecorator}
 */
export function Body(...pipes: (ImplNailyBackendPipe | Type<ImplNailyBackendPipe>)[]): ParameterDecorator {
  return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
    const parameterTypes: any[] = Reflect.getMetadata("design:paramtypes", target, propertyKey) || [];
    const parameterType = parameterTypes[parameterIndex] || undefined;

    const oldParameterMetadata: INailyParameterMetadata[] = Reflect.getMetadata(NailyBackendConstant.PARAMETER, target, propertyKey) || [];
    oldParameterMetadata[parameterIndex] = {
      type: INailyParameter.Body,
      designType: parameterType,
      pipes,
    };
    Reflect.defineMetadata(NailyBackendConstant.PARAMETER, oldParameterMetadata, target, propertyKey);
  };
}

/**
 * The `Header` decorator is used to inject the request headers into the controller method.
 *
 * @export
 * @return {ParameterDecorator}
 */
export function Headers(): ParameterDecorator {
  return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
    const parameterTypes: any[] = Reflect.getMetadata("design:paramtypes", target, propertyKey) || [];
    const parameterType = parameterTypes[parameterIndex] || undefined;

    const oldParameterMetadata: INailyParameterMetadata[] = Reflect.getMetadata(NailyBackendConstant.PARAMETER, target, propertyKey) || [];
    oldParameterMetadata[parameterIndex] = {
      type: INailyParameter.Headers,
      designType: parameterType,
    };
    Reflect.defineMetadata(NailyBackendConstant.PARAMETER, oldParameterMetadata, target, propertyKey);
  };
}

/**
 * The `Ip` decorator is used to inject the request ip into the controller method.
 *
 * @export
 * @return {ParameterDecorator}
 */
export function Ip(): ParameterDecorator {
  return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
    const parameterTypes: any[] = Reflect.getMetadata("design:paramtypes", target, propertyKey) || [];
    const parameterType = parameterTypes[parameterIndex] || undefined;

    const oldParameterMetadata: INailyParameterMetadata[] = Reflect.getMetadata(NailyBackendConstant.PARAMETER, target, propertyKey) || [];
    oldParameterMetadata[parameterIndex] = {
      type: INailyParameter.Ip,
      designType: parameterType,
    };
    Reflect.defineMetadata(NailyBackendConstant.PARAMETER, oldParameterMetadata, target, propertyKey);
  };
}

/**
 * The `Ips` decorator is used to inject the request ips into the controller method.
 *
 * @export
 * @return {ParameterDecorator}
 */
export function Ips(): ParameterDecorator {
  return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
    const parameterTypes: any[] = Reflect.getMetadata("design:paramtypes", target, propertyKey) || [];
    const parameterType = parameterTypes[parameterIndex] || undefined;

    const oldParameterMetadata: INailyParameterMetadata[] = Reflect.getMetadata(NailyBackendConstant.PARAMETER, target, propertyKey) || [];
    oldParameterMetadata[parameterIndex] = {
      type: INailyParameter.Ips,
      designType: parameterType,
    };
    Reflect.defineMetadata(NailyBackendConstant.PARAMETER, oldParameterMetadata, target, propertyKey);
  };
}

/**
 * The `Request` decorator is used to inject the request into the controller method.
 *
 * @export
 * @return {ParameterDecorator}
 */
export function Request(): ParameterDecorator {
  return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
    const parameterTypes: any[] = Reflect.getMetadata("design:paramtypes", target, propertyKey) || [];
    const parameterType = parameterTypes[parameterIndex] || undefined;

    const oldParameterMetadata: INailyParameterMetadata[] = Reflect.getMetadata(NailyBackendConstant.PARAMETER, target, propertyKey) || [];
    oldParameterMetadata[parameterIndex] = {
      type: INailyParameter.Request,
      designType: parameterType,
    };
    Reflect.defineMetadata(NailyBackendConstant.PARAMETER, oldParameterMetadata, target, propertyKey);
  };
}

/**
 * The `Response` decorator is used to inject the response into the controller method.
 *
 * @export
 * @return {ParameterDecorator}
 */
export function Response(): ParameterDecorator {
  return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
    const parameterTypes: any[] = Reflect.getMetadata("design:paramtypes", target, propertyKey) || [];
    const parameterType = parameterTypes[parameterIndex] || undefined;

    const oldParameterMetadata: INailyParameterMetadata[] = Reflect.getMetadata(NailyBackendConstant.PARAMETER, target, propertyKey) || [];
    oldParameterMetadata[parameterIndex] = {
      type: INailyParameter.Response,
      designType: parameterType,
    };
    Reflect.defineMetadata(NailyBackendConstant.PARAMETER, oldParameterMetadata, target, propertyKey);
  };
}

/**
 * The `Next` decorator is used to inject the next function into the controller method.
 *
 * @export
 * @return {ParameterDecorator}
 */
export function Next(): ParameterDecorator {
  return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
    const parameterTypes: any[] = Reflect.getMetadata("design:paramtypes", target, propertyKey) || [];
    const parameterType = parameterTypes[parameterIndex] || undefined;

    const oldParameterMetadata: INailyParameterMetadata[] = Reflect.getMetadata(NailyBackendConstant.PARAMETER, target, propertyKey) || [];
    oldParameterMetadata[parameterIndex] = {
      type: INailyParameter.Next,
      designType: parameterType,
    };
    Reflect.defineMetadata(NailyBackendConstant.PARAMETER, oldParameterMetadata, target, propertyKey);
  };
}

/**
 * The `Context` decorator is used to inject the context into the controller method.
 *
 * @remarks This is only available for the `context` adapter type, like `Koa`.
 * @export
 * @return {ParameterDecorator}
 */
export function Context(): ParameterDecorator {
  return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
    const parameterTypes: any[] = Reflect.getMetadata("design:paramtypes", target, propertyKey) || [];
    const parameterType = parameterTypes[parameterIndex] || undefined;

    const oldParameterMetadata: INailyParameterMetadata[] = Reflect.getMetadata(NailyBackendConstant.PARAMETER, target, propertyKey) || [];
    oldParameterMetadata[parameterIndex] = {
      type: INailyParameter.Context,
      designType: parameterType,
    };
    Reflect.defineMetadata(NailyBackendConstant.PARAMETER, oldParameterMetadata, target, propertyKey);
  };
}
