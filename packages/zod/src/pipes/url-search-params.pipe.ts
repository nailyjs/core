import { IPipeContext } from '@nailyjs/backend'
import { Injectable } from '@nailyjs/ioc'
import { RULE_METADATA_WATERMARK, RuleMetadata } from '../decorators'
import { AbstractValidationPipeService } from './abstract-validation.pipe'

@Injectable()
export class UrlSearchParamsPipeService extends AbstractValidationPipeService {
  transformUrlSearchParams(value: URLSearchParams, context: IPipeContext): any {
    const metadata = context.getMetadata()
    const parameterIndex = metadata.getParameterIndex()
    const reflectedParamType = context.getHandler().getDesignParamTypes()
    const reflectedClass = reflectedParamType[parameterIndex]
    if (!this.isClass(reflectedClass)) return value
    const ruleMetadata: RuleMetadata[] = Reflect.getMetadata(RULE_METADATA_WATERMARK, reflectedClass) || []

    const record = super.urlSearchParamsToRecord(value)
    for (const { schema, propertyKey } of ruleMetadata) {
      if (typeof propertyKey === 'symbol') continue
      record[propertyKey] = schema.parse(record[propertyKey])
    }

    return (reflectedClass instanceof URLSearchParams || reflectedClass.prototype instanceof URLSearchParams)
      ? super.recordToUrlSearchParams(record)
      : record
  }
}
