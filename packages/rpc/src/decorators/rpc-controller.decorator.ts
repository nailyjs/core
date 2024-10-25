import type { InjectableOptions, InjectionToken } from '@nailyjs/ioc'
import { Injectable } from '@nailyjs/ioc'
import { RpcControllerSymbol } from '../constant'

/**
 * Mark a class as an RPC controller.
 *
 * It also marks the class as an injectable service. You can use the `@Inject` decorator to inject other services into the controller, but
 *
 * @export
 * @param {InjectionToken} id The ID of the RPC controller，which is used to identify the controller. If not provided, the class itself will be used as the ID.
 * @param {Partial<InjectableOptions>} [options] Options for the injectable service.
 * @return {ClassDecorator}
 */
export function RpcController(id: InjectionToken, options: Partial<InjectableOptions> = {}): ClassDecorator {
  return ((target) => {
    Injectable(options)(target)
    Reflect.defineMetadata(RpcControllerSymbol, id || target, target)
  }) as ClassDecorator
}
