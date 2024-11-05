export interface CliConfiguration {
  /** Path to the logo file. the file must a txt file. */
  banner?: `${string}.txt` | false
}

declare global {
  namespace Naily {
    namespace Configuration {
      interface NailyUserConfig {
        /** Configuration for the naily cli. */
        cli?: CliConfiguration
      }
    }
  }
}
