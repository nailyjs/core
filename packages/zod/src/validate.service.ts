import { Class, Injectable } from '@nailyjs/ioc'
import { SafeParseReturnType, z, ZodRawShape } from 'zod'
import { RULE_METADATA_WATERMARK, RuleMetadata } from './decorators'

export type ClassTargetToObject<Target extends Class> = {
  [K in keyof InstanceType<Target>]: InstanceType<Target>[K]
}

@Injectable()
export class ValidateService {
  parse<Target extends Class>(target: Target, data: any): ClassTargetToObject<Target> {
    const metadata: RuleMetadata[] = Reflect.getMetadata(RULE_METADATA_WATERMARK, target) || []
    const raw: ZodRawShape = {}

    for (const { schema, propertyKey } of metadata) {
      raw[propertyKey as string] = schema
    }

    return z.object(raw).parse(data) as ClassTargetToObject<Target>
  }

  safeParse<Target extends Class>(target: Target, data: any): SafeParseReturnType<ClassTargetToObject<Target>, ClassTargetToObject<Target>> {
    const metadata: RuleMetadata[] = Reflect.getMetadata(RULE_METADATA_WATERMARK, target) || []
    const raw: ZodRawShape = {}

    for (const { schema, propertyKey } of metadata) {
      raw[propertyKey as string] = schema
    }

    return z.object(raw).safeParse(data) as SafeParseReturnType<ClassTargetToObject<Target>, ClassTargetToObject<Target>>
  }
}
