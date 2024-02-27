import { IToken, Injectable, ScopeEnum, Type } from "@nailyjs/core";
import { NailyBackendConstant } from "../constants";
import { INailyControllerMetadata, INailyControllerMapping, RequestMethod } from "../typings/metadata.typing";

export function Controller(path?: string): ClassDecorator;
export function Controller(path?: string, extraOptions?: Partial<{ token: IToken; version: string }>): ClassDecorator;
export function Controller(path: string = "/", extraOptions: Partial<{ token: IToken; version: string }> = {}) {
  return (target: Type) => {
    Injectable({
      scope: ScopeEnum.Singleton,
      token: target,
    })(target);
    Reflect.defineMetadata(
      NailyBackendConstant.CONTROLLER,
      {
        path: path || "/",
        version: extraOptions.version,
      } satisfies INailyControllerMetadata,
      target,
    );
  };
}

export function Get(path?: string): MethodDecorator;
export function Get(path: string = "/") {
  return (target: Object, propertyKey: string | symbol) => {
    const oldMapping: INailyControllerMapping[] = Reflect.getMetadata(NailyBackendConstant.MAPPING, target, propertyKey) || [];
    oldMapping.push({ method: RequestMethod.GET, path });
    Reflect.defineMetadata(NailyBackendConstant.MAPPING, oldMapping, target, propertyKey);
  };
}

export function Post(path?: string): MethodDecorator;
export function Post(path: string = "/") {
  return (target: Object, propertyKey: string | symbol) => {
    const oldMapping: INailyControllerMapping[] = Reflect.getMetadata(NailyBackendConstant.MAPPING, target, propertyKey) || [];
    oldMapping.push({ method: RequestMethod.POST, path });
    Reflect.defineMetadata(NailyBackendConstant.MAPPING, oldMapping, target, propertyKey);
  };
}

export function Put(path?: string): MethodDecorator;
export function Put(path: string = "/") {
  return (target: Object, propertyKey: string | symbol) => {
    const oldMapping: INailyControllerMapping[] = Reflect.getMetadata(NailyBackendConstant.MAPPING, target, propertyKey) || [];
    oldMapping.push({ method: RequestMethod.PUT, path });
    Reflect.defineMetadata(NailyBackendConstant.MAPPING, oldMapping, target, propertyKey);
  };
}

export function Delete(path?: string): MethodDecorator;
export function Delete(path: string = "/") {
  return (target: Object, propertyKey: string | symbol) => {
    const oldMapping: INailyControllerMapping[] = Reflect.getMetadata(NailyBackendConstant.MAPPING, target, propertyKey) || [];
    oldMapping.push({ method: RequestMethod.DELETE, path });
    Reflect.defineMetadata(NailyBackendConstant.MAPPING, oldMapping, target, propertyKey);
  };
}

export function Patch(path?: string): MethodDecorator;
export function Patch(path: string = "/") {
  return (target: Object, propertyKey: string | symbol) => {
    const oldMapping: INailyControllerMapping[] = Reflect.getMetadata(NailyBackendConstant.MAPPING, target, propertyKey) || [];
    oldMapping.push({ method: RequestMethod.PATCH, path });
    Reflect.defineMetadata(NailyBackendConstant.MAPPING, oldMapping, target, propertyKey);
  };
}

export function Options(path?: string): MethodDecorator;
export function Options(path: string = "/") {
  return (target: Object, propertyKey: string | symbol) => {
    const oldMapping: INailyControllerMapping[] = Reflect.getMetadata(NailyBackendConstant.MAPPING, target, propertyKey) || [];
    oldMapping.push({ method: RequestMethod.OPTIONS, path });
    Reflect.defineMetadata(NailyBackendConstant.MAPPING, oldMapping, target, propertyKey);
  };
}

export function Head(path?: string): MethodDecorator;
export function Head(path: string = "/") {
  return (target: Object, propertyKey: string | symbol) => {
    const oldMapping: INailyControllerMapping[] = Reflect.getMetadata(NailyBackendConstant.MAPPING, target, propertyKey) || [];
    oldMapping.push({ method: RequestMethod.HEAD, path });
    Reflect.defineMetadata(NailyBackendConstant.MAPPING, oldMapping, target, propertyKey);
  };
}

export function All(path?: string): MethodDecorator;
export function All(path: string = "/") {
  return (target: Object, propertyKey: string | symbol) => {
    const oldMapping: INailyControllerMapping[] = Reflect.getMetadata(NailyBackendConstant.MAPPING, target, propertyKey) || [];
    oldMapping.push({ method: RequestMethod.ALL, path });
    Reflect.defineMetadata(NailyBackendConstant.MAPPING, oldMapping, target, propertyKey);
  };
}
