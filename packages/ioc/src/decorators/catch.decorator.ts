/** eslint-disable unused-imports/no-unused-imports */

import type { Class } from '../types'
import { CatchSymbol, FilterSymbol, FinallySymbol } from '../constants'
import { Injectable, InjectableOptions } from './injectable.decorator'

/**
 * ### Mark a class as an error handler.
 *
 * This decorator is used to catch errors that are thrown by the class.
 * If no error types are provided, it will catch all errors.
 *
 * It also marks the class as an {@linkcode Injectable} class. If you want
 * to custom the {@linkcode InjectableOptions}, you can use the {@linkcode Injectable} decorator before this decorator.
 *
 * @export
 * @param {...any[]} error Error types to catch. If no error types are provided, it will catch all errors.
 * @return {ClassDecorator}
 */
export function Filter(...error: any[]): ClassDecorator {
  return ((target: Class, propertyKey?: string | symbol) => {
    Reflect.defineMetadata(FilterSymbol, error.length === 0 ? true : error, target, propertyKey)
    Injectable()(target as Class)
  }) as ClassDecorator
}

/**
 * ### Mark a class method as an error handler.
 *
 * This decorator is used to catch errors that are thrown by the class method.
 * If no error types are provided, it will catch all errors.
 * If the {@linkcode Filter} decorator is not used in the class, it will not
 * catch any errors. The {@linkcode Filter} decorator is used to mark the class
 * as an error handler.
 *
 * If the {@linkcode Filter} decorator is used in the class and specific error
 * types are provided, it will catch the specific error types. If no error types
 * are provided, it will catch all errors.
 *
 * @export
 * @param {...any[]} error Error types to catch. If no error types are provided, it will catch all errors. It just can catch the {@linkcode Filter} decorator provided error types.
 * @return {MethodDecorator}
 */
export function Catch(...error: any[]): MethodDecorator {
  return ((target, propertyKey) => {
    Reflect.defineMetadata(CatchSymbol, error.length === 0 ? true : error, target.constructor, propertyKey)
  }) as MethodDecorator
}

/**
 * ### Mark a class method as a finally handler.
 *
 * This decorator is used to execute the class method after the try-catch block.
 * It will execute after the catch block. If the {@linkcode Filter} decorator is
 * not used in the class, it will not execute any method. The {@linkcode Filter}
 * decorator is used to mark the class as an error handler.
 *
 * @export
 * @param {...any[]} error Error types to catch. If no error types are provided, it will catch all errors. It just can catch the {@linkcode Filter} decorator provided error types.
 * @return {MethodDecorator}
 */
export function Finally(...error: any[]): MethodDecorator {
  return ((target, propertyKey) => {
    Reflect.defineMetadata(FinallySymbol, error.length === 0 ? true : error, target.constructor, propertyKey)
  }) as MethodDecorator
}
