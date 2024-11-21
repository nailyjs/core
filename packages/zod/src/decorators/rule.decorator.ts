import { Class } from '@nailyjs/ioc'
import { z } from 'zod'
import 'reflect-metadata'

export const RULE_METADATA_WATERMARK = 'zod:rule'
export const RULE_CLASS_METADATA_WATERMARK = 'zod:rule:class'
export interface RuleMetadata {
  schema?: z.ZodSchema
  propertyKey: string | symbol
}

export type CustomShapeFn = (shapeSchema: z.ZodObject<z.ZodRawShape>) => z.ZodObject<z.ZodRawShape>

export function Rule(schema: z.ZodSchema): PropertyDecorator
export function Rule(customShape: CustomShapeFn): ClassDecorator
export function Rule(autoInferTypes?: undefined): PropertyDecorator
export function Rule(schemaOrCustomShape?: z.ZodSchema | CustomShapeFn): PropertyDecorator | ClassDecorator {
  return ((target: Object | Class, propertyKey?: string | symbol) => {
    if (!propertyKey) return Reflect.defineMetadata(RULE_CLASS_METADATA_WATERMARK, schemaOrCustomShape, target)

    const oldMetadata: RuleMetadata[] = Reflect.getMetadata(RULE_METADATA_WATERMARK, target.constructor === Function ? target : target.constructor) || []
    if (oldMetadata.some(metadata => metadata.propertyKey === propertyKey))
      throw new Error(`Rule already defined for ${((target.constructor === Function ? target : target.constructor) as (...args: any[]) => any).name}.${String(propertyKey)}.`)
    Reflect.defineMetadata(RULE_METADATA_WATERMARK, [
      ...oldMetadata,
      {
        schema: schemaOrCustomShape as z.ZodSchema,
        propertyKey,
      } as RuleMetadata,
    ] as RuleMetadata[], target.constructor === Function ? target : target.constructor)
  }) as PropertyDecorator | ClassDecorator
}
