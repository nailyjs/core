import type { InjectionToken } from '../types'
import { Container } from '../container'

export function Constant<Value>(token: InjectionToken, value: Value): PropertyDecorator & ClassDecorator & MethodDecorator {
  return (() => {
    new Container().createConstantWrapper(token, value).save()
  }) as ClassDecorator & PropertyDecorator
}
