import antfu from '@antfu/eslint-config'

declare global {
  namespace Naily {
    namespace Configuration {
      interface NailyUserConfig {
        eslint?: Parameters<typeof antfu>[0] & {
          extraOptions?: Array<Parameters<typeof antfu>[1]>
        }
      }
    }
  }
}
