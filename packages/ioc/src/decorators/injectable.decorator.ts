import type { Class, InjectableOptions } from '../types'
import { InjectableWatermark } from '../constant'
import { Container } from '../container'

export function Injectable(options: Partial<InjectableOptions> = {}): ClassDecorator {
  return ((target: Class) => {
    Reflect.defineMetadata(InjectableWatermark, options || {}, target)
    new Container().createClassWrapper(target).save()
  }) as ClassDecorator
}
