import { Injectable } from '@nailyjs/ioc'

@Injectable()
export abstract class AbstractValidationPipeService {
  urlSearchParamsToRecord(params: URLSearchParams): Record<string, string | readonly string[]> {
    const result: Record<string, string | readonly string[]> = {}

    params.forEach((value, key) => {
      if (result[key] !== undefined) {
        if (typeof result[key] === 'string') {
          result[key] = [result[key] as string, value]
        }
        else {
          (result[key] as string[]).push(value)
        }
      }
      else {
        result[key] = value
      }
    })

    return result
  }

  recordToUrlSearchParams(record: Record<string, string | readonly string[]>): URLSearchParams {
    const params = new URLSearchParams()

    for (const [key, value] of Object.entries(record)) {
      if (typeof value === 'string') {
        params.set(key, value)
      }
      else {
        for (const item of value) {
          params.append(key, item)
        }
      }
    }

    return params
  }

  isClass(value: unknown): value is new (...args: any[]) => any {
    return typeof value === 'function' && /^\s*class\s+/.test(value.toString())
  }
}
