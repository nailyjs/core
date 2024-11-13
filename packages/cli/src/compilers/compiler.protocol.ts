import type { Stats } from 'node:fs'
import { ServerResponse } from 'node:http'
import { AbstractBootstrap, Setupable } from '@nailyjs/ioc'
import { Connect, ViteDevServer as ViteServer } from 'vite'

export interface Compiler extends Setupable {
  onWatch?(
    ev: string,
    changedPath: string,
    stat: Stats,
  ): void | Promise<void>
}

export interface ViteDevServerMiddlewareContext {
  getBootstrap(): AbstractBootstrap
  getViteServer(): ViteServer
  getRequest(): Connect.IncomingMessage
  getResponse(): ServerResponse
}

export const ViteDevServer = '__naily_vite_dev_server__'
export interface ViteDevServer {
  middleware(context: ViteDevServerMiddlewareContext, next: Connect.NextFunction): Promise<void> | void
}
