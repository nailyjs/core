import type { UserConfig } from 'vite'

export type ExcludeDefault<T extends string> = T extends 'default' ? never : T

export interface Options {
  /** @default './backend/main.ts' */
  serverEntry?: string
  /**
   * Cannot be `default`.
   * @default 'app'
   */
  entryExport?: ExcludeDefault<string>
  watchDirs?: string[] | string
  /**
   * Vite build options.
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
