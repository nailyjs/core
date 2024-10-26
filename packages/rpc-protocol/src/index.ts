import type { JSONSchema7 as JSONSchema } from 'json-schema'

export interface JsonRpcParamsObject {
  description?: string
  name?: string
  required?: boolean
  schema?: JSONSchema
}

export interface JsonRpcResultObject {
  description?: string
  schema?: JSONSchema
}

export interface JsonRpcDocsObject {
  description?: string
  summary?: string
  tags?: string[]
  params: JsonRpcParamsObject[]
  result?: JsonRpcResultObject
}

export interface JsonRpcDoc {
  jsonrpc: '2.0'
  tags: string[]
  docs: Record<string, JsonRpcDocsObject>
}
