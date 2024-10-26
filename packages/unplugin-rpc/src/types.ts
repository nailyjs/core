import type * as swc from 'unplugin-swc'
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
  viteOptions?: UserConfig
  swcOptions?: swc.Options
}
