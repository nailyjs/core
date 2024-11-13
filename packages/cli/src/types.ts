import type * as tsup from 'tsup'
import type { UserConfig } from 'vite'
import { Options } from 'unplugin-rpc/types'

export interface CliDevelopmentBaseConfiguration {}

export interface TsupConfiguration extends CliDevelopmentBaseConfiguration {
  using?: 'tsup'
  tsup?: tsup.Options
  runnerEntry?: string
  watchPaths?: string | string[]
}

export interface ViteConfiguration extends CliDevelopmentBaseConfiguration {
  using?: 'vite'
  vite?: UserConfig
  rpc?: false | Omit<Options, 'build' | 'entryExport' | 'serverEntry'>
  entryExport?: string
  serverEntry?: string
}

export type CliDevelopmentConfiguration = TsupConfiguration | ViteConfiguration
export interface CliBuildConfiguration extends TsupConfiguration {}

export interface CliConfiguration {
  /** Path to the logo file. the file must a txt file. */
  banner?: `${string}.txt` | false
  development?: CliDevelopmentConfiguration
  build?: CliBuildConfiguration
}

export interface CliIntelliSense extends CliConfiguration {
  development?: {
    using?: 'tsup' | 'vite'
    vite?: UserConfig
    tsup?: tsup.Options
    rpc?: false | Omit<Options, 'build'>
    entryExport?: string
    serverEntry?: string
  }
}

declare global {
  namespace Naily {
    namespace Configuration {
      interface NailyUserConfig {
        /** Configuration for the naily cli. */
        cli?: CliConfiguration
      }

      interface NailyUserIntelliSense {
        cli?: CliIntelliSense
      }
    }
  }
}
