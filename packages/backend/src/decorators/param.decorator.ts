import { Type } from "@nailyjs/core";
import { NailyBackendWatermark } from "../constants";

export function Params(...pipes: Type[]): ParameterDecorator;
export function Params(id: string, ...pipes: Type[]): ParameterDecorator;
export function Params(id: string | Type, ...pipes: Type[]) {
  return (target: Object, propertyKey: string | symbol, index: number) => {
    const oldMetadata: NBackend.ParamMetadata[] = Reflect.getMetadata(NailyBackendWatermark.PARAMETER, target, propertyKey) || [];
    oldMetadata[index] = {
      id: typeof id === "string" ? id : undefined,
      pipes: [...(typeof id !== "string" ? [id] : []), ...pipes],
      type: "param",
    };
    Reflect.defineMetadata(NailyBackendWatermark.PARAMETER, oldMetadata, target, propertyKey);
  };
}

export function Query(...pipes: Type[]): ParameterDecorator;
export function Query(id: string, ...pipes: Type[]): ParameterDecorator;
export function Query(id: string | Type, ...pipes: Type[]) {
  return (target: Object, propertyKey: string | symbol, index: number) => {
    const oldMetadata: NBackend.ParamMetadata[] = Reflect.getMetadata(NailyBackendWatermark.PARAMETER, target, propertyKey) || [];
    oldMetadata[index] = {
      id: typeof id === "string" ? id : undefined,
      pipes: [...(typeof id !== "string" ? [id] : []), ...pipes],
      type: "query",
    };
    Reflect.defineMetadata(NailyBackendWatermark.PARAMETER, oldMetadata, target, propertyKey);
  };
}

export function Body(...pipes: Type[]): ParameterDecorator;
export function Body(id: string, ...pipes: Type[]): ParameterDecorator;
export function Body(id: string | Type, ...pipes: Type[]) {
  return (target: Object, propertyKey: string | symbol, index: number) => {
    const oldMetadata: NBackend.ParamMetadata[] = Reflect.getMetadata(NailyBackendWatermark.PARAMETER, target, propertyKey) || [];
    oldMetadata[index] = {
      id: typeof id === "string" ? id : undefined,
      pipes: [...(typeof id !== "string" ? [id] : []), ...pipes],
      type: "body",
    };
    Reflect.defineMetadata(NailyBackendWatermark.PARAMETER, oldMetadata, target, propertyKey);
  };
}

export function Headers(...pipes: Type[]): ParameterDecorator;
export function Headers(id: string, ...pipes: Type[]): ParameterDecorator;
export function Headers(id: string | Type, ...pipes: Type[]) {
  return (target: Object, propertyKey: string | symbol, index: number) => {
    const oldMetadata: NBackend.ParamMetadata[] = Reflect.getMetadata(NailyBackendWatermark.PARAMETER, target, propertyKey) || [];
    oldMetadata[index] = {
      id: typeof id === "string" ? id : undefined,
      pipes: [...(typeof id !== "string" ? [id] : []), ...pipes],
      type: "headers",
    };
    Reflect.defineMetadata(NailyBackendWatermark.PARAMETER, oldMetadata, target, propertyKey);
  };
}

export function Ip(): ParameterDecorator;
export function Ip() {
  return (target: Object, propertyKey: string | symbol, index: number) => {
    const oldMetadata: NBackend.ParamMetadata[] = Reflect.getMetadata(NailyBackendWatermark.PARAMETER, target, propertyKey) || [];
    oldMetadata[index] = {
      type: "ip",
    };
    Reflect.defineMetadata(NailyBackendWatermark.PARAMETER, oldMetadata, target, propertyKey);
  };
}

export function Req(): ParameterDecorator;
export function Req() {
  return (target: Object, propertyKey: string | symbol, index: number) => {
    const oldMetadata: NBackend.ParamMetadata[] = Reflect.getMetadata(NailyBackendWatermark.PARAMETER, target, propertyKey) || [];
    oldMetadata[index] = {
      type: "req",
    };
    Reflect.defineMetadata(NailyBackendWatermark.PARAMETER, oldMetadata, target, propertyKey);
  };
}

export function Res(): ParameterDecorator;
export function Res() {
  return (target: Object, propertyKey: string | symbol, index: number) => {
    const oldMetadata: NBackend.ParamMetadata[] = Reflect.getMetadata(NailyBackendWatermark.PARAMETER, target, propertyKey) || [];
    oldMetadata[index] = {
      type: "res",
    };
    Reflect.defineMetadata(NailyBackendWatermark.PARAMETER, oldMetadata, target, propertyKey);
  };
}

export function Ctx(): ParameterDecorator;
export function Ctx() {
  return (target: Object, propertyKey: string | symbol, index: number) => {
    const oldMetadata: NBackend.ParamMetadata[] = Reflect.getMetadata(NailyBackendWatermark.PARAMETER, target, propertyKey) || [];
    oldMetadata[index] = {
      type: "ctx",
    };
    Reflect.defineMetadata(NailyBackendWatermark.PARAMETER, oldMetadata, target, propertyKey);
  };
}
