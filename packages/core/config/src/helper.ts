declare global {
  namespace Naily {
    export interface NailyConfig {
      [key: string]: any
    }
    export interface UserConfig {
      naily?: Partial<NailyConfig>
    }
  }
}

export function defineConfig(config: Naily.UserConfig): Naily.UserConfig {
  return config
}
