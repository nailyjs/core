import { Class, Component, InjectionToken } from '@nailyjs/ioc'
import 'reflect-metadata'

export const RpcControllerMetadataWatermark = '__naily_rpc_controller__'

export function RpcController(injectionToken: InjectionToken): ClassDecorator {
  return ((target: Class) => {
    Reflect.defineMetadata(RpcControllerMetadataWatermark, injectionToken, target)
    Component(injectionToken)(target)
  }) as ClassDecorator
}
