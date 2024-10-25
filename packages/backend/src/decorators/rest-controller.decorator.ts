import type { InjectableOptions } from '@nailyjs/ioc'
import { Injectable } from '@nailyjs/ioc'
import { RestControllerSymbol } from '../constant'

export interface RestControllerOptions extends InjectableOptions {}

/**
 * Mark a class as a restful controller.
 *
 * @export
 * @param {string} [prefix]
 * @param {Partial<RestControllerOptions>} [options]
 * @return {ClassDecorator}
 */
export function RestController(prefix: string = '/', options?: Partial<RestControllerOptions>): ClassDecorator {
  return ((target) => {
    Injectable(options)(target)
    Reflect.defineMetadata(RestControllerSymbol, prefix, target)
  }) as ClassDecorator
}
