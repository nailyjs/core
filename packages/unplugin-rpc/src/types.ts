import type { UserConfig } from 'vite'

export type ExcludeDefault<T extends string> = T extends 'default' ? never : T

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
   * Build server vite options.
   */
  viteOptions?: UserConfig
  /**
   * Build server on Vite close bundle.
   *
   * e.g. If you are using `vite-ssg`, you should set this to `false` and build the server in `ssgOptions.onFinished`.
   *
   * @default true
   */
  buildOnViteCloseBundle?: boolean
}
