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

export class JsonRpcDataSource {
  constructor(private readonly doc: JsonRpcDoc) {}

  getAllTags(): string[] {
    return [
      ...this.doc.tags,
      ...Object.keys(this.doc.docs).map((key) => {
        return this.doc.docs[key].tags
      }).flat().filter(tag => tag !== undefined).filter((tag, index, self) => self.indexOf(tag) === index),
    ]
  }

  getDocByTag(tag: string): [string, JsonRpcDocsObject][] {
    return Object.entries(this.doc.docs).filter(([_key, docObject]) => {
      return docObject.tags?.includes(tag)
    })
  }

  getNoTagDoc(): [string, JsonRpcDocsObject][] {
    return Object.entries(this.doc.docs).filter(([_key, docObject]) => {
      return docObject.tags === undefined || docObject.tags.length === 0
    })
  }
}
