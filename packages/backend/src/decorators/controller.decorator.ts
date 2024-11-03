import type { ControllerOptions } from '../types'
import { type Class, Injectable } from '@nailyjs/ioc'
import { RestControllerWatermark } from '../constant'
import 'reflect-metadata'

export function RestController(prefix: string = '/', options: Partial<Omit<ControllerOptions, 'prefix'>> = {}): ClassDecorator {
  return ((target: Class) => {
    Reflect.defineMetadata(RestControllerWatermark, {
      prefix,
      ...options,
    } as ControllerOptions, target)
    Injectable(options)(target)
  }) as ClassDecorator
}
