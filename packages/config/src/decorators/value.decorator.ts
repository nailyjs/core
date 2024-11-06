import { Optional } from '@nailyjs/ioc'
import { FullObject, Path } from '../types'
import '../helper'
import 'reflect-metadata'

export const ValueWatermark = '__naily_config_value__'

export interface ValueMetadata {
  propertyKey: string | symbol
  jexl: string
  parameterIndex?: number
}

export function Value<ConfigObject extends Record<string, any> = Naily.Configuration.UserIntelliSense>(jexl: Path<FullObject<ConfigObject>> | (string & {})): PropertyDecorator & ParameterDecorator
export function Value<Key extends string>(jexl: Key): PropertyDecorator & ParameterDecorator
export function Value(jexl: string = ''): PropertyDecorator & ParameterDecorator {
  return ((target: Object, propertyKey: string | symbol, parameterIndex?: number) => {
    if (typeof parameterIndex === 'number') Optional()(target, propertyKey, parameterIndex)

    Reflect.defineMetadata(ValueWatermark, [
      ...(Reflect.getMetadata(ValueWatermark, target.constructor === Function ? target : target.constructor) || []),
      { propertyKey, jexl, parameterIndex } as ValueMetadata,
    ] as ValueMetadata[], target.constructor === Function ? target : target.constructor)
  }) as PropertyDecorator & ParameterDecorator
}
