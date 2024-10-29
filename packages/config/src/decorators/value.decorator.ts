export interface ValueMetadata {
  path: string
  propertyKey: string | symbol
  parameterIndex: number
}

export function Value(path: string = ''): ParameterDecorator & PropertyDecorator {
  return ((target: Object, propertyKey: string | symbol, parameterIndex) => {
    Reflect.defineMetadata('__value__', [
      ...(Reflect.getMetadata('__value__', target.constructor) || []),
      {
        path,
        propertyKey,
        parameterIndex,
      },
    ] as ValueMetadata[], target.constructor)
  }) as ParameterDecorator & PropertyDecorator
}
