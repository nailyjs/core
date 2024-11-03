export interface IHandlerRequest extends Request {
  [key: string]: any
}

export class HandlerRequest extends Request implements IHandlerRequest {
  private _jsonResult: any | null = null
  async json(): Promise<any> {
    if (this._jsonResult) return this._jsonResult
    this._jsonResult = await super.json()
    return this._jsonResult
  }

  private _arrayBufferResult: ArrayBuffer | null = null
  async arrayBuffer(): Promise<ArrayBuffer> {
    if (this._arrayBufferResult) return this._arrayBufferResult
    this._arrayBufferResult = await super.arrayBuffer()
    return this._arrayBufferResult
  }

  private _textResult: string | null = null
  async text(): Promise<string> {
    if (this._textResult) return this._textResult
    this._textResult = await super.text()
    return this._textResult
  }

  private _formDataResult: FormData | null = null
  async formData(): Promise<FormData> {
    if (this._formDataResult) return this._formDataResult
    this._formDataResult = await super.formData()
    return this._formDataResult
  }

  private _bodyResult: any | null = null
  get body(): ReadableStream<Uint8Array> {
    if (this._bodyResult) return this._bodyResult
    this._bodyResult = super.body
    return this._bodyResult
  }
}
