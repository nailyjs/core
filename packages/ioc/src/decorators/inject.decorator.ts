import type { InjectionToken, InjectOptions } from '../types'
import { InjectWatermark } from '../constant'

export function Inject(options: Partial<Omit<InjectOptions, 'parameterIndex' | 'propertyKey'>> = {}): ParameterDecorator & PropertyDecorator {
  return ((target, propertyKey, parameterIndex) => {
    const oldMetadata: InjectOptions[] = Reflect.getMetadata(InjectWatermark, typeof parameterIndex === 'number' ? target : target.constructor) || []
    const equal = (injectOptions: InjectOptions): boolean => injectOptions.parameterIndex === parameterIndex && injectOptions.propertyKey === propertyKey
    const injectOptions = oldMetadata.find(equal)
    if (!injectOptions) return Reflect.defineMetadata(InjectWatermark, [
      ...oldMetadata,
      {
        optional: false,
        ...options,
        parameterIndex,
        propertyKey,
      },
    ] as InjectOptions[], typeof parameterIndex === 'number' ? target : target.constructor)

    Reflect.defineMetadata(InjectWatermark, oldMetadata.map((injectOptions) => {
      return equal(injectOptions)
        ? {
            ...injectOptions,
            ...options,
          }
        : injectOptions
    }), typeof parameterIndex === 'number' ? target : target.constructor)
  }) as ParameterDecorator & PropertyDecorator
}

export function Autowired(injectionToken?: InjectionToken, options: Partial<Omit<InjectOptions, 'parameterIndex' | 'propertyKey' | 'injectionToken'>> = {}): ParameterDecorator & PropertyDecorator {
  return Inject({ ...options, injectionToken })
}

export function Optional(): ParameterDecorator & PropertyDecorator {
  return ((target, propertyKey, parameterIndex) => {
    const metadata: InjectOptions[] = Reflect.getMetadata(InjectWatermark, typeof parameterIndex === 'number' ? target : target.constructor) || []
    const injectOptions = metadata.find(injectOptions =>
      (injectOptions.parameterIndex === parameterIndex) && (injectOptions.propertyKey === propertyKey),
    )

    return Inject({ ...(injectOptions || {}), optional: true })(target, propertyKey, parameterIndex)
  }) as ParameterDecorator & PropertyDecorator
}
