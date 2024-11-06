import antfu from '@antfu/eslint-config'

declare global {
  namespace Naily {
    namespace Configuration {
      interface NailyUserConfig {
        /**
         * Eslint config.
         *
         * If you want to define eslint config into this object, you must create `eslint.config.js` file in the root of your project,
         * and add the following code:
         * ```js
         * import { nailyProxy } from '@nailyjs/eslint'
         *
         * export default await nailyProxy()
         * ```
         * It will proxy the config from `naily.config.ts` to this `naily.eslint` object.
         */
        eslint?: Omit<Parameters<typeof antfu>[0], 'overrides'> & {
          extraOptions?: Array<Parameters<typeof antfu>[1]>
        }
      }
    }
  }
}
