import { z } from 'zod'

export namespace JsonRpcSchema {
  export type Id = string | number

  export interface RequestSchema<TParam extends (any[] | Record<string, any>) = any[], TId extends Id = Id> {
    jsonrpc: '2.0'
    id?: TId
    method: string
    params: TParam
  }

  export function createRequestSchema<ParamsSchema extends z.ZodTuple>(paramsSchema?: ParamsSchema): z.ZodObject<{
    jsonrpc: z.ZodLiteral<'2.0'>
    id: z.ZodUnion<[z.ZodString, z.ZodNumber]>
    method: z.ZodString
    params: ParamsSchema
  }> {
    if (!paramsSchema)
      paramsSchema = z.array(z.any()) as any
    return z.object({
      jsonrpc: z.literal('2.0'),
      id: z.union([z.string(), z.number()]),
      method: z.string(),
      params: paramsSchema,
    })
  }

  export interface ResponseSuccessSchema<TResult = any, TId extends Id = Id> {
    jsonrpc: '2.0'
    id: TId
    result: TResult
  }

  export function createRequestSuccessSchema<ResultSchema extends z.ZodAny>(resultSchema?: ResultSchema): z.ZodObject<{
    jsonrpc: z.ZodLiteral<'2.0'>
    id: z.ZodUnion<[z.ZodString, z.ZodNumber]>
    result: ResultSchema
  }> {
    if (!resultSchema)
      resultSchema = z.any() as any
    return z.object({
      jsonrpc: z.literal('2.0'),
      id: z.union([z.string(), z.number()]),
      result: resultSchema,
    })
  }

  export interface ResponseErrorObject<TData = any> {
    code: number
    message: string
    data?: TData
  }

  export interface ResponseErrorSchema<TErrorData = any, TId extends Id = Id> {
    jsonrpc: '2.0'
    id: TId
    error: ResponseErrorObject<TErrorData>
  }

  export type ResponseSchema<TResult = any, TErrorData = any, TId extends Id = Id> = ResponseSuccessSchema<TResult, TId> | ResponseErrorSchema<TErrorData, TId>
}
