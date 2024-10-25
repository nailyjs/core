import type { IncomingHttpHeaders, IncomingMessage, ServerResponse } from 'node:http'
import type { TLSSocket } from 'node:tls'
import { Buffer } from 'node:buffer'
import { Writable } from 'node:stream'

export interface TransformIncomingMessageToRequestReturn {
  getRequest: () => Promise<Request>
  readBody: (incomingMessage: IncomingMessage) => Promise<Buffer>
  readHeaders: (incomingMessage: IncomingMessage) => Headers
  getFullUrl: (incomingMessage: IncomingMessage) => string
}

export function transformIncomingMessageToRequest(incomingMessage: IncomingMessage): TransformIncomingMessageToRequestReturn {
  function readBody(incomingMessage: IncomingMessage): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks = []
      incomingMessage.on('data', (chunk) => {
        chunks.push(chunk)
      })
      incomingMessage.on('end', () => {
        resolve(Buffer.concat(chunks))
      })
      incomingMessage.on('error', (err) => {
        reject(err)
      })
    })
  }

  function readHeaders(incomingMessage: IncomingMessage): Headers {
    const headers = new Headers()
    for (const [key, value] of Object.entries(incomingMessage.headers)) {
      if (Array.isArray(value)) {
        headers.append(key, value.join(', '))
      }
      else {
        headers.append(key, value)
      }
    }
    return headers
  }

  function getFullUrl(incomingMessage: IncomingMessage): string {
    const protocol = (incomingMessage.socket as TLSSocket).encrypted ? 'https' : 'http'
    return `${protocol}://${incomingMessage.headers.host}${incomingMessage.url}`
  }

  async function getRequest(): Promise<Request> {
    const body = await readBody(incomingMessage)
    const fullUrl = getFullUrl(incomingMessage)

    return new Request(fullUrl, {
      method: incomingMessage.method,
      headers: readHeaders(incomingMessage),
      body: body.length > 0 ? body : null,
    })
  }

  return {
    getRequest,
    readBody,
    readHeaders,
    getFullUrl,
  }
}

export interface TransformServerResponseToResponseReturn {
  getResponse: () => Promise<Response>
  readHeaders: (res: ServerResponse<IncomingMessage>) => Headers
  captureResponseBody: (res: ServerResponse<IncomingMessage>) => Promise<Buffer>
}

export function transformServerResponseToResponse(serverResponse: ServerResponse<IncomingMessage>): TransformServerResponseToResponseReturn {
  function captureResponseBody(res: ServerResponse<IncomingMessage>): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks = []
      const writable = new Writable({
        write(chunk, encoding, callback) {
          chunks.push(chunk)
          callback()
        },
      })

      // 将 ServerResponse 写入到 Writable 流中
      res.pipe(writable)

      writable.on('finish', () => {
        resolve(Buffer.concat(chunks))
      })

      writable.on('error', (err) => {
        reject(err)
      })
    })
  }

  function readHeaders(res: ServerResponse<IncomingMessage>): Headers {
    // 获取响应头部信息
    const headers = new Headers()
    const rawHeaders = res.getHeaders()
    for (const [key, value] of Object.entries(rawHeaders)) {
      if (Array.isArray(value)) {
        headers.append(key, value.join(', '))
      }
      else {
        headers.append(key, value.toString())
      }
    }
    return headers
  }

  async function getResponse(): Promise<Response> {
    const body = await captureResponseBody(serverResponse)
    return new Response(body, {
      status: serverResponse.statusCode,
      statusText: serverResponse.statusMessage,
      headers: readHeaders(serverResponse),
    })
  }

  return {
    getResponse,
    readHeaders,
    captureResponseBody,
  }
}

export interface SendResponseReturn {
  send: () => ServerResponse<IncomingMessage> | Promise<ServerResponse<IncomingMessage>>
  readHeaders: (response: Response) => IncomingHttpHeaders
}

export function sendResponse(response: Response, serverResponse: ServerResponse<IncomingMessage>): SendResponseReturn {
  function readHeaders(response: Response): IncomingHttpHeaders {
    const headers: IncomingHttpHeaders = {}
    for (const [key, value] of response.headers) {
      headers[key] = value
    }
    return headers
  }

  function readBody(body: ReadableStream<Uint8Array>): Promise<string> {
    const reader = body.getReader()
    let result = ''
    return reader.read().then(function processText({ done, value }) {
      if (done) {
        return result
      }
      result += new TextDecoder().decode(value)
      return reader.read().then(processText)
    })
  }

  async function send(): Promise<ServerResponse<IncomingMessage>> {
    return serverResponse
      .writeHead(response.status, response.statusText, readHeaders(response))
      .end(await readBody(response.body))
  }

  return {
    send,
    readHeaders,
  }
}
