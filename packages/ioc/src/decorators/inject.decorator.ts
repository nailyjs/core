import type { InjectOptions } from '../types'
import { InjectWatermark } from '../constant'

export function Inject(options: Partial<Omit<InjectOptions, 'parameterIndex' | 'propertyKey'>> = {}): ParameterDecorator & PropertyDecorator {
  return ((target, propertyKey, parameterIndex) => {
    Reflect.defineMetadata(InjectWatermark, [
      ...(Reflect.getMetadata(InjectWatermark, typeof parameterIndex === 'number' ? target.constructor : target) || []),
      {
        ...options,
        parameterIndex: typeof parameterIndex === 'number' ? parameterIndex : undefined,
        propertyKey: typeof parameterIndex === 'number' ? undefined : propertyKey,
      },
    ] as InjectOptions[], typeof parameterIndex === 'number' ? target.constructor : target)
  }) as ParameterDecorator & PropertyDecorator
}
