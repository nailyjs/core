declare global {
  namespace Naily {
    export namespace Configuration {
      export interface NailyUserConfig {
        [key: string]: any
      }
      export interface UserConfig {
        naily?: NailyUserConfig
        [key: string]: any
      }

      export interface NailyUserIntelliSense {
        [key: string]: any
      }
      export interface UserIntelliSense {
        naily?: NailyUserIntelliSense
        [key: string]: any
      }
    }
  }
}

export function defineConfig(config: Naily.Configuration.UserConfig): Naily.Configuration.UserConfig {
  return config
}
