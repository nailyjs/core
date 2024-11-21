/* eslint-disable ts/no-unsafe-function-type */
import { Class, ClassWrapper, Container, Injectable } from '@nailyjs/ioc'
import { SafeParseReturnType, z, ZodRawShape } from 'zod'
import { CustomShapeFn, RULE_CLASS_METADATA_WATERMARK, RULE_METADATA_WATERMARK, RuleMetadata } from './decorators'

export type ClassTargetToObject<Target extends Class> = {
  [K in keyof InstanceType<Target>]: InstanceType<Target>[K]
}
@Injectable()
export class ValidateService {
  /**
   * Transform internal class to zod type.
   *
   * @param typing Internal class.
   * @param args The arguments for the zod type.
   */
  static transformInternalClass(typing: String, ...args: Parameters<typeof z.string>): z.ZodString | undefined
  static transformInternalClass(typing: Number, ...args: Parameters<typeof z.number>): z.ZodNumber | undefined
  static transformInternalClass(typing: Boolean, ...args: Parameters<typeof z.boolean>): z.ZodBoolean | undefined
  static transformInternalClass(typing: Array<any>, ...args: Parameters<typeof z.array>): z.ZodArray<z.ZodType> | undefined
  static transformInternalClass(typing: Date, ...args: Parameters<typeof z.date>): z.ZodDate | undefined
  static transformInternalClass(typing: Symbol, ...args: Parameters<typeof z.symbol>): z.ZodSymbol | undefined
  static transformInternalClass(typing: BigInt, ...args: Parameters<typeof z.bigint>): z.ZodBigInt | undefined
  static transformInternalClass(typing: undefined, ...args: Parameters<typeof z.undefined>): z.ZodUndefined | undefined
  static transformInternalClass(typing: null, ...args: Parameters<typeof z.null>): z.ZodNull | undefined
  static transformInternalClass(typing: Function, ...args: Parameters<typeof z.function>): z.ZodFunction<any, any> | undefined
  static transformInternalClass(typing: Map<any, any>, ...args: Parameters<typeof z.map>): z.ZodMap | undefined
  static transformInternalClass(typing: Set<any>, ...args: Parameters<typeof z.set>): z.ZodSet | undefined
  static transformInternalClass(typing: unknown, ...args: any[]): z.ZodType | undefined {
    switch (typing) {
      case String:
        return z.string(args[0])
      case Number:
        return z.number(args[0])
      case Boolean:
        return z.boolean(args[0])
      case Array:
        return z.array(args[0] || z.any(), args[1])
      case Date:
        return z.date(args[0])
      case Symbol:
        return z.symbol(args[0])
      case BigInt:
        return z.bigint(args[0])
      case undefined:
        return z.undefined(args[0])
      case null:
        return z.null(args[0])
      case Function:
        return z.function(args[0], args[1], args[2])
      case Map:
        return z.map(args[0] || z.any(), args[1] || z.any())
      case Set:
        return z.set(args[0] || z.any())
    }
  }

  static transformClassToObject<Target extends Class>(target: Target): z.ZodObject<ClassTargetToObject<Target>> {
    const ruleMetadata: RuleMetadata[] = Reflect.getMetadata(RULE_METADATA_WATERMARK, target) || []
    const classTargetMetaCustomShapeFn: CustomShapeFn = Reflect.getMetadata(RULE_CLASS_METADATA_WATERMARK, target) || (s => s)
    const raw: ZodRawShape = {}

    for (const { schema, propertyKey } of ruleMetadata) {
      if (!propertyKey) continue
      if (schema) {
        raw[propertyKey as string] = schema
        continue
      }

      const propertyType = Reflect.getMetadata('design:type', target.prototype, propertyKey)
      if (!propertyType) continue
      const transformInternalClassResult = this.transformInternalClass(propertyType)
      if (transformInternalClassResult) {
        raw[propertyKey as string] = transformInternalClassResult
        continue
      }

      if (!Reflect.hasMetadata(RULE_METADATA_WATERMARK, propertyType)) continue

      const propertyTypeZodType = this.transformClassToObject(propertyType)
      raw[propertyKey as string] = propertyTypeZodType
    }

    return classTargetMetaCustomShapeFn(z.object(raw)) as z.ZodObject<ClassTargetToObject<Target>>
  }

  parse<Target extends Class>(target: Target, data: any): ClassTargetToObject<Target> {
    const classRaw = ValidateService.transformClassToObject(target)
    return classRaw.parse(data) as ClassTargetToObject<Target>
  }

  safeParse<Target extends Class>(target: Target, data: any): SafeParseReturnType<ClassTargetToObject<Target>, ClassTargetToObject<Target>> {
    const classRaw = ValidateService.transformClassToObject(target)
    return classRaw.safeParse(data) as SafeParseReturnType<ClassTargetToObject<Target>, ClassTargetToObject<Target>>
  }

  static getInstance(container: Container): ValidateService {
    const map = container.getContainer().get(ValidateService) as ClassWrapper<ValidateService>
    if (map) return map.getClassFactory().getOrCreateInstance()
    else return container.createClassWrapper(ValidateService).getClassFactory().getOrCreateInstance()
  }
}
