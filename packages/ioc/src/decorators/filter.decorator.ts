import type { Class } from '../types'
import { CatchWatermark, FilterWatermark } from '../constant'
import { Container } from '../container'

export function Filter(...errors: any[]): ClassDecorator {
  return ((target: Class) => {
    Reflect.defineMetadata(FilterWatermark, errors || [], target)
    new Container().createClassWrapper(target).save()
  }) as ClassDecorator
}

export function Catch(...errors: any[]): MethodDecorator {
  return ((target, propertyKey) => {
    Reflect.defineMetadata(CatchWatermark, [
      ...(Reflect.getMetadata(CatchWatermark, target.constructor) || []),
      { propertyKey, errors },
    ], target.constructor)
  }) as MethodDecorator
}
