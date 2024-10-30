import { OptionalSymbol } from '../constants'

export interface OptionalMetadata {
  propertyKey: string | symbol
  parameterIndex: number
}

export function Optional(): ParameterDecorator & PropertyDecorator {
  return ((target: Object, propertyKey: string | symbol, parameterIndex: number) => {
    Reflect.defineMetadata(OptionalSymbol, [
      ...(Reflect.getMetadata(OptionalSymbol, typeof parameterIndex === 'number' ? target : target.constructor) || []),
      {
        propertyKey,
        parameterIndex,
      },
    ] as OptionalMetadata[], typeof parameterIndex === 'number' ? target : target.constructor)
  }) as ParameterDecorator & PropertyDecorator
}
