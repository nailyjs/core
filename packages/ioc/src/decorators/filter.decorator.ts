import type { Class, FilterMetadata } from '../types'
import { FilterWatermark } from '../constant'
import { Injectable } from './injectable.decorator'

export function Filter(...errors: any[]): ClassDecorator {
  return ((target: Class) => {
    Reflect.defineMetadata(FilterWatermark, {
      errors: errors || [],
    } as FilterMetadata, target)
    Injectable()(target)
  }) as ClassDecorator
}
