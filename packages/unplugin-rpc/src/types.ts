import type { UserConfig } from 'vite'
import { SwcOptions } from './core/swc'

export type ExcludeDefault<T extends string> = T extends 'default' ? never : T

export interface BuildOptions {
  /**
   * Build server on Vite close bundle.
   *
   * e.g. If you are using `vite-ssg`, you should set this to `false` and build the server in `ssgOptions.onFinished` hook.
   *
   * @default 'closeBundle'
   */
  on: 'closeBundle' | false
  /**
   * Build server vite options.
   */
  viteOptions?: UserConfig
  /**
   * Override build swc options.
   */
  swcOptions?: SwcOptions
}

export interface PreviewOptions {
  /** @default '/rpc' */
  baseURL?: string
  /** @default path.resolve('./dist/backend/main.js') */
  serverEntry?: string
  /** @default true */
  forceColor?: boolean
}

export interface Options<EntryExport extends string = string> {
  /** @default './backend/main.ts' */
  serverEntry?: string
  /**
   * Cannot be `default`.
   * @default 'app'
   */
  entryExport?: ExcludeDefault<EntryExport>
  /**
   * Watch dirs for server build.
   */
  watchDirs?: string[] | string
  /**
   * Build options.
   */
  build?: BuildOptions
  preview?: PreviewOptions
}
