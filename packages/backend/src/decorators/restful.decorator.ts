import type { ControllerHandlerOptions } from '../types'
import { RestfulWatermark } from '../constant'

export function Get(path: string = '/', options: Partial<Omit<ControllerHandlerOptions, 'propertyKey' | 'path' | 'method'>> = {}): MethodDecorator {
  return ((target, propertyKey) => {
    Reflect.defineMetadata(RestfulWatermark, [
      ...(Reflect.getMetadata(RestfulWatermark, target.constructor) || []),
      {
        ...options,
        propertyKey,
        path,
        method: 'GET',
      },
    ] as ControllerHandlerOptions[], target.constructor)
  }) as MethodDecorator
}

export function Post(path: string = '/', options: Partial<Omit<ControllerHandlerOptions, 'propertyKey' | 'path' | 'method'>> = {}): MethodDecorator {
  return ((target, propertyKey) => {
    Reflect.defineMetadata(RestfulWatermark, [
      ...(Reflect.getMetadata(RestfulWatermark, target.constructor) || []),
      {
        ...options,
        propertyKey,
        path,
        method: 'POST',
      },
    ] as ControllerHandlerOptions[], target.constructor)
  }) as MethodDecorator
}

export function Put(path: string = '/', options: Partial<Omit<ControllerHandlerOptions, 'propertyKey' | 'path' | 'method'>> = {}): MethodDecorator {
  return ((target, propertyKey) => {
    Reflect.defineMetadata(RestfulWatermark, [
      ...(Reflect.getMetadata(RestfulWatermark, target.constructor) || []),
      {
        ...options,
        propertyKey,
        path,
        method: 'PUT',
      },
    ] as ControllerHandlerOptions[], target.constructor)
  }) as MethodDecorator
}

export function Delete(path: string = '/', options: Partial<Omit<ControllerHandlerOptions, 'propertyKey' | 'path' | 'method'>> = {}): MethodDecorator {
  return ((target, propertyKey) => {
    Reflect.defineMetadata(RestfulWatermark, [
      ...(Reflect.getMetadata(RestfulWatermark, target.constructor) || []),
      {
        ...options,
        propertyKey,
        path,
        method: 'DELETE',
      },
    ] as ControllerHandlerOptions[], target.constructor)
  }) as MethodDecorator
}

export function Patch(path: string = '/', options: Partial<Omit<ControllerHandlerOptions, 'propertyKey' | 'path' | 'method'>> = {}): MethodDecorator {
  return ((target, propertyKey) => {
    Reflect.defineMetadata(RestfulWatermark, [
      ...(Reflect.getMetadata(RestfulWatermark, target.constructor) || []),
      {
        ...options,
        propertyKey,
        path,
        method: 'PATCH',
      },
    ] as ControllerHandlerOptions[], target.constructor)
  }) as MethodDecorator
}

export function Options(path: string = '/', options: Partial<Omit<ControllerHandlerOptions, 'propertyKey' | 'path' | 'method'>> = {}): MethodDecorator {
  return ((target, propertyKey) => {
    Reflect.defineMetadata(RestfulWatermark, [
      ...(Reflect.getMetadata(RestfulWatermark, target.constructor) || []),
      {
        ...options,
        propertyKey,
        path,
        method: 'OPTIONS',
      },
    ] as ControllerHandlerOptions[], target.constructor)
  }) as MethodDecorator
}

export function Head(path: string = '/', options: Partial<Omit<ControllerHandlerOptions, 'propertyKey' | 'path' | 'method'>> = {}): MethodDecorator {
  return ((target, propertyKey) => {
    Reflect.defineMetadata(RestfulWatermark, [
      ...(Reflect.getMetadata(RestfulWatermark, target.constructor) || []),
      {
        ...options,
        propertyKey,
        path,
        method: 'HEAD',
      },
    ] as ControllerHandlerOptions[], target.constructor)
  }) as MethodDecorator
}

export function Trace(path: string = '/', options: Partial<Omit<ControllerHandlerOptions, 'propertyKey' | 'path' | 'method'>> = {}): MethodDecorator {
  return ((target, propertyKey) => {
    Reflect.defineMetadata(RestfulWatermark, [
      ...(Reflect.getMetadata(RestfulWatermark, target.constructor) || []),
      {
        ...options,
        propertyKey,
        path,
        method: 'TRACE',
      },
    ] as ControllerHandlerOptions[], target.constructor)
  }) as MethodDecorator
}

export function All(path: string = '/', options: Partial<Omit<ControllerHandlerOptions, 'propertyKey' | 'path' | 'method'>> = {}): MethodDecorator {
  return ((target, propertyKey) => {
    Reflect.defineMetadata(RestfulWatermark, [
      ...(Reflect.getMetadata(RestfulWatermark, target.constructor) || []),
      {
        ...options,
        propertyKey,
        path,
        method: 'ALL',
      },
    ] as ControllerHandlerOptions[], target.constructor)
  }) as MethodDecorator
}
