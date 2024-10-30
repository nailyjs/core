import { Optional } from '@nailyjs/ioc'

export interface ValueMetadata {
  path: string
  propertyKey: string | symbol
  parameterIndex: number
}

function ValueFactory(path: string = ''): ParameterDecorator & PropertyDecorator {
  return ((target: Object, propertyKey: string | symbol, parameterIndex) => {
    Reflect.defineMetadata('__value__', [
      ...(Reflect.getMetadata('__value__', typeof parameterIndex === 'number' ? target : target.constructor,
      ) || []),
      {
        path,
        propertyKey,
        parameterIndex,
      },
    ] as ValueMetadata[], typeof parameterIndex === 'number' ? target : target.constructor)
  }) as ParameterDecorator & PropertyDecorator
}

export function Value(path: string = ''): ParameterDecorator & PropertyDecorator {
  return ((target: Object, propertyKey: string | symbol, parameterIndex: number) => {
    Optional()(target, propertyKey, parameterIndex)
    ValueFactory(path)(target, propertyKey, parameterIndex)
  }) as ParameterDecorator & PropertyDecorator
}
