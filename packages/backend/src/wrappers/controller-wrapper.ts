import type { ClassWrapper } from '@nailyjs/ioc'
import type { ControllerHandlerOptions, ControllerOptions } from '../types'
import { RestControllerWatermark, RestfulWatermark } from '../constant'
import { SingleControllerHandlerWrapper } from './single-controller-handler-wrapper'

export class RestControllerWrapper {
  constructor(private readonly controller: ClassWrapper) {}

  getClassWrapper(): ClassWrapper {
    return this.controller
  }

  isController(): boolean {
    return this.controller.hasMetadata(RestControllerWatermark)
  }

  getControllerMetadata(): ControllerOptions {
    return this.controller.getMetadata(RestControllerWatermark)
  }

  getControllerPrefix(): string {
    return this.getControllerMetadata().prefix || '/'
  }

  getControllerHandlerMetadata(): SingleControllerHandlerWrapper[] {
    return ((this.controller.getMetadata(RestfulWatermark) || []) as ControllerHandlerOptions[])
      .map(options => new SingleControllerHandlerWrapper(this, options))
  }

  mergePathnames(path1: string, path2: string): string {
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
}
