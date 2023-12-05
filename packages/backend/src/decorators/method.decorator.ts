import { NailyBackendWatermark } from "../constants";

export function Get(path?: string): MethodDecorator;
export function Get(path: string = "/") {
  return (target: any, propertyKey: string | symbol) => {
    const metadata: NBackend.MethodMetadata = {
      path: path,
      method: "get",
    };
    const oldMetadata: NBackend.MethodMetadata[] = Reflect.getMetadata(NailyBackendWatermark.METHOD, target, propertyKey) || [];
    oldMetadata.push(metadata);
    Reflect.defineMetadata(NailyBackendWatermark.METHOD, oldMetadata, target, propertyKey);
  };
}

export function Post(path?: string): MethodDecorator;
export function Post(path: string = "/") {
  return (target: any, propertyKey: string | symbol) => {
    const metadata: NBackend.MethodMetadata = {
      path: path,
      method: "post",
    };
    const oldMetadata: NBackend.MethodMetadata[] = Reflect.getMetadata(NailyBackendWatermark.METHOD, target, propertyKey) || [];
    oldMetadata.push(metadata);
    Reflect.defineMetadata(NailyBackendWatermark.METHOD, oldMetadata, target, propertyKey);
  };
}

export function Put(path?: string): MethodDecorator;
export function Put(path: string = "/") {
  return (target: any, propertyKey: string | symbol) => {
    const metadata: NBackend.MethodMetadata = {
      path: path,
      method: "put",
    };
    const oldMetadata: NBackend.MethodMetadata[] = Reflect.getMetadata(NailyBackendWatermark.METHOD, target, propertyKey) || [];
    oldMetadata.push(metadata);
    Reflect.defineMetadata(NailyBackendWatermark.METHOD, oldMetadata, target, propertyKey);
  };
}

export function Delete(path?: string): MethodDecorator;
export function Delete(path: string = "/") {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (target: any, propertyKey: string | symbol) => {
    const metadata: NBackend.MethodMetadata = {
      path: path,
      method: "delete",
    };
    const oldMetadata: NBackend.MethodMetadata[] = Reflect.getMetadata(NailyBackendWatermark.METHOD, target, propertyKey) || [];
    oldMetadata.push(metadata);
    Reflect.defineMetadata(NailyBackendWatermark.METHOD, oldMetadata, target, propertyKey);
  };
}

export function Patch(path?: string): MethodDecorator;
export function Patch(path: string = "/") {
  return (target: any, propertyKey: string | symbol) => {
    const metadata: NBackend.MethodMetadata = {
      path: path,
      method: "patch",
    };
    const oldMetadata: NBackend.MethodMetadata[] = Reflect.getMetadata(NailyBackendWatermark.METHOD, target, propertyKey) || [];
    oldMetadata.push(metadata);
    Reflect.defineMetadata(NailyBackendWatermark.METHOD, oldMetadata, target, propertyKey);
  };
}

export function Options(path?: string): MethodDecorator;
export function Options(path: string = "/") {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (target: any, propertyKey: string | symbol) => {
    const metadata: NBackend.MethodMetadata = {
      path: path,
      method: "options",
    };
    const oldMetadata: NBackend.MethodMetadata[] = Reflect.getMetadata(NailyBackendWatermark.METHOD, target, propertyKey) || [];
    oldMetadata.push(metadata);
    Reflect.defineMetadata(NailyBackendWatermark.METHOD, oldMetadata, target, propertyKey);
  };
}

export function Head(path?: string): MethodDecorator;
export function Head(path: string = "/") {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (target: any, propertyKey: string | symbol) => {
    const metadata: NBackend.MethodMetadata = {
      path: path,
      method: "head",
    };
    const oldMetadata: NBackend.MethodMetadata[] = Reflect.getMetadata(NailyBackendWatermark.METHOD, target, propertyKey) || [];
    oldMetadata.push(metadata);
    Reflect.defineMetadata(NailyBackendWatermark.METHOD, oldMetadata, target, propertyKey);
  };
}

export function Trace(path?: string): MethodDecorator;
export function Trace(path: string = "/") {
  return (target: any, propertyKey: string | symbol) => {
    const metadata: NBackend.MethodMetadata = {
      path: path,
      method: "trace",
    };
    const oldMetadata: NBackend.MethodMetadata[] = Reflect.getMetadata(NailyBackendWatermark.METHOD, target, propertyKey) || [];
    oldMetadata.push(metadata);
    Reflect.defineMetadata(NailyBackendWatermark.METHOD, oldMetadata, target, propertyKey);
  };
}

export function All(path?: string): MethodDecorator;
export function All(path: string = "/") {
  return (target: any, propertyKey: string | symbol) => {
    const metadata: NBackend.MethodMetadata = {
      path: path,
      method: "all",
    };
    const oldMetadata: NBackend.MethodMetadata[] = Reflect.getMetadata(NailyBackendWatermark.METHOD, target, propertyKey) || [];
    oldMetadata.push(metadata);
    Reflect.defineMetadata(NailyBackendWatermark.METHOD, oldMetadata, target, propertyKey);
  };
}
