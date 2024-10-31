import type { InjectableOptions } from '../types'
import { InjectWatermark } from '../constant'

export function Injectable(options: Partial<InjectableOptions> = {}): ClassDecorator {
  return ((target) => {
    Reflect.defineMetadata(InjectWatermark, options || {}, target)
  }) as ClassDecorator
}
