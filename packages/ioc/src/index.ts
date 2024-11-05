/**
 * # `@nailyjs/ioc`
 * This is the core package of naily, which provides the basic IOC features. It is a lightweight、across-platform and easy-to-use IOC meta framework for TypeScript.
 *
 * @module
 * @example
 * ```typescript
 * import { Container, Injectable, Inject } from '@nailyjs/ioc'
 *
 * Injectable()
 * export class FooService {}
 *
 * Injectable()
 * export class BarService {
 *  constructor(private fooService: FooService) {}
 * }
 *
 * // No similar inversify.js, container will automatically inspect the dependencies of the constructors.
 * const container = new Container()
 * console.log(container.getContainer()) // It is a Map object, which contains all the registered services.
 * ```
 */

export * from './apply-decorator'
export * from './bootstrap'
export * from './constant'
export * from './container'
export * from './decorators'
export * from './error-handler-factory'
export * from './errors'
export * from './metadata-scanner'
export * from './plugin-runner'
export * from './plugins'
export * from './protocols'
export * from './task-runner'
export * from './types'
export * from './wrappers'
