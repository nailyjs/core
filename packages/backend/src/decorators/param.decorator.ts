import { NailyBackendWatermark } from "../constants";

export function Params(...pipes: NBackend.SinglePipe[]): ParameterDecorator;
export function Params(id: string, ...pipes: NBackend.SinglePipe[]): ParameterDecorator;
export function Params(id: string | NBackend.SinglePipe, ...pipes: NBackend.SinglePipe[]) {
  return (target: Object, propertyKey: string | symbol, index: number) => {
    const oldMetadata: NBackend.ParamMetadata[] = Reflect.getMetadata(NailyBackendWatermark.PARAMETER, target, propertyKey) || [];
    const paramtypes: any[] = Reflect.getMetadata("design:paramtypes", target, propertyKey) || [];
    oldMetadata[index] = {
      id: typeof id === "string" ? id : undefined,
      pipes: [...(typeof id === "function" || typeof id === "object" ? [id] : []), ...pipes],
      type: "param",
      paramtype: paramtypes[index],
    };
    Reflect.defineMetadata(NailyBackendWatermark.PARAMETER, oldMetadata, target, propertyKey);
  };
}

export function Query(...pipes: NBackend.SinglePipe[]): ParameterDecorator;
export function Query(id: string, ...pipes: NBackend.SinglePipe[]): ParameterDecorator;
export function Query(id: string | NBackend.SinglePipe, ...pipes: NBackend.SinglePipe[]) {
  return (target: Object, propertyKey: string | symbol, index: number) => {
    const oldMetadata: NBackend.ParamMetadata[] = Reflect.getMetadata(NailyBackendWatermark.PARAMETER, target, propertyKey) || [];
    const paramtypes: any[] = Reflect.getMetadata("design:paramtypes", target, propertyKey) || [];
    oldMetadata[index] = {
      id: typeof id === "string" ? id : undefined,
      pipes: [...(typeof id === "function" || typeof id === "object" ? [id] : []), ...pipes],
      type: "query",
      paramtype: paramtypes[index],
    };
    Reflect.defineMetadata(NailyBackendWatermark.PARAMETER, oldMetadata, target, propertyKey);
  };
}

export function Body(...pipes: NBackend.SinglePipe[]): ParameterDecorator;
export function Body(id: string, ...pipes: NBackend.SinglePipe[]): ParameterDecorator;
export function Body(id: string | NBackend.SinglePipe, ...pipes: NBackend.SinglePipe[]) {
  return (target: Object, propertyKey: string | symbol, index: number) => {
    const oldMetadata: NBackend.ParamMetadata[] = Reflect.getMetadata(NailyBackendWatermark.PARAMETER, target, propertyKey) || [];
    const paramtypes: any[] = Reflect.getMetadata("design:paramtypes", target, propertyKey) || [];
    oldMetadata[index] = {
      id: typeof id === "string" ? id : undefined,
      pipes: [...(typeof id === "function" || typeof id === "object" ? [id] : []), ...pipes],
      type: "body",
      paramtype: paramtypes[index],
    };
    Reflect.defineMetadata(NailyBackendWatermark.PARAMETER, oldMetadata, target, propertyKey);
  };
}

export function Headers(...pipes: NBackend.SinglePipe[]): ParameterDecorator;
export function Headers(id: string, ...pipes: NBackend.SinglePipe[]): ParameterDecorator;
export function Headers(id: string | NBackend.SinglePipe, ...pipes: NBackend.SinglePipe[]) {
  return (target: Object, propertyKey: string | symbol, index: number) => {
    const oldMetadata: NBackend.ParamMetadata[] = Reflect.getMetadata(NailyBackendWatermark.PARAMETER, target, propertyKey) || [];
    const paramtypes: any[] = Reflect.getMetadata("design:paramtypes", target, propertyKey) || [];
    oldMetadata[index] = {
      id: typeof id === "string" ? id : undefined,
      pipes: [...(typeof id === "function" || typeof id === "object" ? [id] : []), ...pipes],
      type: "headers",
      paramtype: paramtypes[index],
    };
    Reflect.defineMetadata(NailyBackendWatermark.PARAMETER, oldMetadata, target, propertyKey);
  };
}

export function Ip(): ParameterDecorator;
export function Ip() {
  return (target: Object, propertyKey: string | symbol, index: number) => {
    const oldMetadata: NBackend.ParamMetadata[] = Reflect.getMetadata(NailyBackendWatermark.PARAMETER, target, propertyKey) || [];
    const paramtypes: any[] = Reflect.getMetadata("design:paramtypes", target, propertyKey) || [];
    oldMetadata[index] = {
      type: "ip",
      paramtype: paramtypes[index],
    };
    Reflect.defineMetadata(NailyBackendWatermark.PARAMETER, oldMetadata, target, propertyKey);
  };
}

export function Req(): ParameterDecorator;
export function Req() {
  return (target: Object, propertyKey: string | symbol, index: number) => {
    const oldMetadata: NBackend.ParamMetadata[] = Reflect.getMetadata(NailyBackendWatermark.PARAMETER, target, propertyKey) || [];
    const paramtypes: any[] = Reflect.getMetadata("design:paramtypes", target, propertyKey) || [];
    oldMetadata[index] = {
      type: "req",
      paramtype: paramtypes[index],
    };
    Reflect.defineMetadata(NailyBackendWatermark.PARAMETER, oldMetadata, target, propertyKey);
  };
}

export function Res(): ParameterDecorator;
export function Res() {
  return (target: Object, propertyKey: string | symbol, index: number) => {
    const oldMetadata: NBackend.ParamMetadata[] = Reflect.getMetadata(NailyBackendWatermark.PARAMETER, target, propertyKey) || [];
    const paramtypes: any[] = Reflect.getMetadata("design:paramtypes", target, propertyKey) || [];
    oldMetadata[index] = {
      type: "res",
      paramtype: paramtypes[index],
    };
    Reflect.defineMetadata(NailyBackendWatermark.PARAMETER, oldMetadata, target, propertyKey);
  };
}

export function Ctx(): ParameterDecorator;
export function Ctx() {
  return (target: Object, propertyKey: string | symbol, index: number) => {
    const oldMetadata: NBackend.ParamMetadata[] = Reflect.getMetadata(NailyBackendWatermark.PARAMETER, target, propertyKey) || [];
    const paramtypes: any[] = Reflect.getMetadata("design:paramtypes", target, propertyKey) || [];
    oldMetadata[index] = {
      type: "ctx",
      paramtype: paramtypes[index],
    };
    Reflect.defineMetadata(NailyBackendWatermark.PARAMETER, oldMetadata, target, propertyKey);
  };
}
