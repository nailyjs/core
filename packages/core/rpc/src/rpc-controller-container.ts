import type { Class, InjectableWrapper } from '@nailyjs/ioc'
import { BackendContainer } from '@nailyjs/backend'
import { RpcControllerSymbol } from './constant'

export class RpcControllerContainer extends BackendContainer {
  private isRpcController(target: Class): boolean {
    return Reflect.hasMetadata(RpcControllerSymbol, target)
  }

  private getRpcControllerId(target: Class): string | symbol {
    return Reflect.getMetadata(RpcControllerSymbol, target)
  }

  async eachRpcController(callback: (target: Record<string | symbol, any>, methodKey: string | symbol, wrapper: InjectableWrapper, rpcId: string | symbol) => any): Promise<this> {
    const container = this.getInjectableContainer()

    for (const wrapper of container) {
      if (wrapper.isFilter()) continue
      if (!wrapper.isInjectable()) continue
      if (!this.isRpcController(wrapper.getTarget())) continue

      const rpcControllerId = this.getRpcControllerId(wrapper.getTarget())
      const methodKeys = wrapper.getPrototypeKeys().filter(key => key !== 'constructor')

      for (const methodKey of methodKeys)
        await callback(wrapper.getOrCreateInstance(), methodKey, wrapper, rpcControllerId)
    }

    return this
  }
}
