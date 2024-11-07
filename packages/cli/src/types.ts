import type * as tsup from 'tsup'

export interface TsupDevelopmentConfiguration {
  using?: 'tsup'
  tsup?: tsup.Options
}

export interface CliDevelopmentConfiguration extends TsupDevelopmentConfiguration {
  runnerEntry?: string
}

export interface CliConfiguration {
  /** Path to the logo file. the file must a txt file. */
  banner?: `${string}.txt` | false
  development?: CliDevelopmentConfiguration
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
