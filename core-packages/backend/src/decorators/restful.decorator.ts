import type { RestfulMetadata } from '../types'
import { RestfulMetadataSymbol } from '../constant'

export function Get(path: string = '/'): MethodDecorator {
  return ((target, propertyKey) => {
    Reflect.defineMetadata(RestfulMetadataSymbol, [
      ...Reflect.getMetadata(RestfulMetadataSymbol, target.constructor, propertyKey) || [],
      { method: 'GET', path },
    ] as RestfulMetadata[], target.constructor, propertyKey)
  }) as MethodDecorator
}

export function Post(path: string = '/'): MethodDecorator {
  return ((target, propertyKey) => {
    Reflect.defineMetadata(RestfulMetadataSymbol, [
      ...Reflect.getMetadata(RestfulMetadataSymbol, target.constructor, propertyKey) || [],
      { method: 'POST', path },
    ] as RestfulMetadata[], target.constructor, propertyKey)
  }) as MethodDecorator
}

export function Put(path: string = '/'): MethodDecorator {
  return ((target, propertyKey) => {
    Reflect.defineMetadata(RestfulMetadataSymbol, [
      ...Reflect.getMetadata(RestfulMetadataSymbol, target.constructor, propertyKey) || [],
      { method: 'PUT', path },
    ] as RestfulMetadata[], target.constructor, propertyKey)
  }) as MethodDecorator
}

export function Delete(path: string = '/'): MethodDecorator {
  return ((target, propertyKey) => {
    Reflect.defineMetadata(RestfulMetadataSymbol, [
      ...Reflect.getMetadata(RestfulMetadataSymbol, target.constructor, propertyKey) || [],
      { method: 'DELETE', path },
    ] as RestfulMetadata[], target.constructor, propertyKey)
  }) as MethodDecorator
}

export function Patch(path: string = '/'): MethodDecorator {
  return ((target, propertyKey) => {
    Reflect.defineMetadata(RestfulMetadataSymbol, [
      ...Reflect.getMetadata(RestfulMetadataSymbol, target.constructor, propertyKey) || [],
      { method: 'PATCH', path },
    ] as RestfulMetadata[], target.constructor, propertyKey)
  }) as MethodDecorator
}

export function Head(path: string = '/'): MethodDecorator {
  return ((target, propertyKey) => {
    Reflect.defineMetadata(RestfulMetadataSymbol, [
      ...Reflect.getMetadata(RestfulMetadataSymbol, target.constructor, propertyKey) || [],
      { method: 'HEAD', path },
    ] as RestfulMetadata[], target.constructor, propertyKey)
  }) as MethodDecorator
}

export function Options(path: string = '/'): MethodDecorator {
  return ((target, propertyKey) => {
    Reflect.defineMetadata(RestfulMetadataSymbol, [
      ...Reflect.getMetadata(RestfulMetadataSymbol, target.constructor, propertyKey) || [],
      { method: 'OPTIONS', path },
    ] as RestfulMetadata[], target.constructor, propertyKey)
  }) as MethodDecorator
}

export function All(path: string = '/'): MethodDecorator {
  return ((target, propertyKey) => {
    Reflect.defineMetadata(RestfulMetadataSymbol, [
      ...Reflect.getMetadata(RestfulMetadataSymbol, target.constructor, propertyKey) || [],
      { method: 'ALL', path },
    ] as RestfulMetadata[], target.constructor, propertyKey)
  }) as MethodDecorator
}
