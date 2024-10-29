import type { Class, InjectionToken, ScopeType } from '../types'
import { InjectableSymbol } from '../constants/constant'
import { Container } from '../container'
import { InjectableWrapper } from '../injectable-wrapper'
import 'reflect-metadata'

export interface InjectableOptions {
  /**
   * Save current target class to metadata.
   *
   * @type {Class}
   * @memberof InjectableOptions
   */
  currentTarget: Class
  /**
   * Scope of the injectable service.
   *
   * @type {ScopeType}
   * @memberof InjectableOptions
   */
  scope: ScopeType
  injectionToken?: InjectionToken | InjectionToken[]
}

/**
 * Mark a class as an injectable service.
 *
 * @export
 * @param {Partial<InjectableOptions>} [options] Options for the injectable service.
 * @return {ClassDecorator}
 */
export function Injectable(options: Partial<InjectableOptions> = {}): ClassDecorator {
  return ((target: Class) => {
    const metadata: Partial<InjectableOptions> = {
      scope: 'singleton',
      ...(options || {}),
      currentTarget: target,
    }
    Reflect.defineMetadata(InjectableSymbol, metadata, target)
    // eslint-disable-next-line dot-notation
    Container['markedInjectable'].add(new InjectableWrapper(target))
  }) as ClassDecorator
}

/**
 * Mark a class as an injectable service.
 *
 * @export
 * @param {Partial<InjectableOptions>} [options] Options for the injectable service.
 * @return {ClassDecorator}
 */
export const Service = Injectable

/**
 * Mark a class as an injectable service.
 *
 * @exports
 * @param {Partial<InjectableOptions>} [options] Options for the injectable service.
 * @return {ClassDecorator}
 */
export const Component = Injectable
