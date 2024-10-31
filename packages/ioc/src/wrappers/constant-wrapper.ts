import type { ContainerWrapper } from '../protocols'
import type { InjectionToken } from '../types'
import { Container } from '../container'

export class ConstantWrapper implements ContainerWrapper {
  constructor(private readonly token: InjectionToken, private readonly value: any) {}

  wrapperType = 'constant' as const

  getInjectionToken(): InjectionToken {
    return this.token
  }

  getGlobalContainer(): Container {
    return new Container()
  }

  save(): void {
    new Container().save(this)
  }
}
