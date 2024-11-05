import type { RpcControllerScanner } from './rpc-controller-scanner'
import { ClassWrapper, InjectionToken } from '@nailyjs/ioc'

export class SingleRpcControllerWrapper {
  constructor(
    private readonly rpcControllerScanner: RpcControllerScanner,
    private readonly classWrapper: ClassWrapper,
  ) {}

  getRpcControllerScanner(): RpcControllerScanner {
    return this.rpcControllerScanner
  }

  getClassWrapper(): ClassWrapper {
    return this.classWrapper
  }

  getOwnKeys(): (string | symbol)[] {
    return Reflect.ownKeys(this.classWrapper.getTarget().prototype) || []
  }

  hasMethod(methodName: string | symbol): boolean {
    const ownKeys = this.getOwnKeys().filter(key => key !== 'constructor')
    return ownKeys.includes(methodName)
  }

  getInjectionToken(): InjectionToken {
    return this.classWrapper.getInjectionToken()
  }
}
