import type { InjectOptions } from '../types'
import { InjectWatermark } from '../constant'

export function Inject(options: Partial<Omit<InjectOptions, 'parameterIndex' | 'propertyKey'>> = {}): ParameterDecorator & PropertyDecorator {
  return ((target, propertyKey, parameterIndex) => {
    Reflect.defineMetadata(InjectWatermark, [
      ...(Reflect.getMetadata(InjectWatermark, typeof parameterIndex === 'number' ? target : target.constructor) || []),
      {
        ...options,
        parameterIndex: typeof parameterIndex === 'number' ? parameterIndex : undefined,
        propertyKey: typeof parameterIndex === 'number' ? undefined : propertyKey,
      },
    ] as InjectOptions[], typeof parameterIndex === 'number' ? target.constructor : target)
  }) as ParameterDecorator & PropertyDecorator
}

export function Optional(): ParameterDecorator & PropertyDecorator {
  return ((target, propertyKey, parameterIndex) => {
    const metadata: InjectOptions[] = Reflect.getMetadata(InjectWatermark, typeof parameterIndex === 'number' ? target : target.constructor) || []
    const injectOptions = metadata.find((injectOptions) => {
      if (typeof parameterIndex === 'number') return injectOptions.parameterIndex === parameterIndex && injectOptions.propertyKey === propertyKey
      return injectOptions.propertyKey === propertyKey
    })
    if (!injectOptions) return Inject({ optional: true })(target, propertyKey, parameterIndex)
    else return Inject({ ...injectOptions, optional: true })(target, propertyKey, parameterIndex)
  }) as ParameterDecorator & PropertyDecorator
}
