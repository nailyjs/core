import type { MatchResult } from 'path-to-regexp'
import type { RestfulMetadata } from './types'
import { Injectable, type InjectableWrapper } from '@nailyjs/ioc'
import { match } from 'path-to-regexp'
import { BackendContainer } from './backend-container'
import { RestControllerSymbol, RestfulMetadataSymbol } from './constant'

export type PatternFnReturn = [InjectableWrapper, string | symbol, MatchResult<Partial<Record<string, string | string[]>>>] | undefined

@Injectable()
export class ControllerMethodExecutor extends BackendContainer {
  constructor() {
    super()
  }

  private patternRestfulMetadata(wrapper: InjectableWrapper, classMethodKey: string | symbol, pathname: string, method: string): PatternFnReturn {
    const methodMetadata: RestfulMetadata[] = Reflect.getMetadata(RestfulMetadataSymbol, wrapper.getTarget(), classMethodKey) || []
    if (!methodMetadata.length) return

    for (let j = 0; j < methodMetadata.length; j++) {
      const prefix = Reflect.getMetadata(RestControllerSymbol, wrapper.getTarget()) || ''
      const mergedPathname = this.mergePathnames(prefix, methodMetadata[j].path)
      const matchResult = match(mergedPathname)(pathname)
      if (!matchResult) continue
      if (methodMetadata[j].method === method) return [wrapper, classMethodKey, matchResult]
    }
  }

  private patternMethodKey(wrapper: InjectableWrapper, pathname: string, method: string): PatternFnReturn {
    const methodKeys: (string | symbol)[] = wrapper.getPrototypeKeys().filter(key => key !== 'constructor')

    for (let i = 0; i < methodKeys.length; i++) {
      const result = this.patternRestfulMetadata(wrapper, methodKeys[i], pathname, method)
      if (result) return result
    }
  }

  private mergePathnames(path1: string, path2: string): string {
    // 如果 path1 或 path2 是 null 或 undefined，将它们视为空字符串
    path1 = path1 || ''
    path2 = path2 || ''

    // 合并两个路径，并用正则去掉多余的斜杠
    let combinedPath = `${path1}/${path2}`.replace(/\/{2,}/g, '/')

    // 如果合并后的路径不是根路径 '/', 则去除末尾的斜杠
    if (combinedPath !== '/' && combinedPath.endsWith('/')) {
      combinedPath = combinedPath.slice(0, -1)
    }

    // 确保路径以 '/' 开头
    return combinedPath.startsWith('/') ? combinedPath : `/${combinedPath}`
  }

  private patternFirstPathnameAndHttpMethod(pathname: string, method: string): PatternFnReturn {
    const container = this.getInjectableContainer()

    for (const wrapper of container) {
      if (!this.wrapperIsController(wrapper)) continue
      const result = this.patternMethodKey(wrapper, pathname, method)
      if (result) return result
    }
  }

  private getHandler(pathname: string, method: string): ((...args: any[]) => any) | undefined {
    const result = this.patternFirstPathnameAndHttpMethod(pathname, method)
    if (!result) return
    const [wrapper, classMethodKey] = result

    const instance = wrapper.getOrCreateInstance()
    return (instance[classMethodKey] as (...args: any[]) => any).bind(instance)
  }

  public async executeResult(request: Request): Promise<any> {
    const { pathname } = new URL(request.url || '', 'http://localhost')
    const handler = this.getHandler(pathname, request.method)
    if (!handler) return new Response('Not Found', { status: 404 })
    return await handler(request)
  }
}
