import type { ContainerWrapper } from '../protocols'
import type { InjectionToken } from '../types'
import { Container } from '../container'

export class ConstantWrapper<Value = any> implements ContainerWrapper {
  constructor(private readonly token: InjectionToken, private value: Value) {}

  wrapperType = 'constant' as const

  getInjectionToken(): InjectionToken {
    return this.token
  }

  getGlobalContainer(): Container {
    return new Container()
  }

  getValue(): Value {
    return this.value
  }

  setValue(value: any): this {
    this.value = value
    return this
  }

  save(): this {
    new Container().save(this)
    return this
  }
}
