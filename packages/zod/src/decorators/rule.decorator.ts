import { z } from 'zod'
import 'reflect-metadata'

export const RULE_METADATA_WATERMARK = 'zod:rule'
export interface RuleMetadata {
  schema: z.ZodSchema
  propertyKey: string | symbol
}

export function Rule(schema: z.ZodSchema): PropertyDecorator {
  return ((target, propertyKey) => {
    const oldMetadata: RuleMetadata[] = Reflect.getMetadata(RULE_METADATA_WATERMARK, target.constructor === Function ? target : target.constructor) || []
    if (oldMetadata.some(metadata => metadata.propertyKey === propertyKey))
      throw new Error(`Rule already defined for ${((target.constructor === Function ? target : target.constructor) as (...args: any[]) => any).name}.${String(propertyKey)}.`)
    Reflect.defineMetadata(RULE_METADATA_WATERMARK, [
      ...oldMetadata,
      {
        schema,
        propertyKey,
      } as RuleMetadata,
    ] as RuleMetadata[], target.constructor === Function ? target : target.constructor)
  }) as PropertyDecorator
}
