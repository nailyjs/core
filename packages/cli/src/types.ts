import type * as tsup from 'tsup'

export interface TsupConfiguration {
  using?: 'tsup'
  tsup?: tsup.Options
}

export interface CliDevelopmentConfiguration extends TsupConfiguration {
  runnerEntry?: string
  watchPaths?: string | string[]
}

export interface CliBuildConfiguration extends TsupConfiguration {}

export interface CliConfiguration {
  /** Path to the logo file. the file must a txt file. */
  banner?: `${string}.txt` | false
  development?: CliDevelopmentConfiguration
  build?: CliBuildConfiguration
}

declare global {
  namespace Naily {
    namespace Configuration {
      interface NailyUserConfig {
        /** Configuration for the naily cli. */
        cli?: CliConfiguration
      }

      interface NailyUserIntelliSense {
        cli?: CliConfiguration
      }
    }
  }
}
