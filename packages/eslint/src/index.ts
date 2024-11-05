import antfu from '@antfu/eslint-config'
import { ConfigPlugin } from '@nailyjs/config'
import { ESLintBootstrap } from './eslint-bootstrap'

export function naily(...args: Parameters<typeof antfu>): ReturnType<typeof antfu> {
  return antfu({
    ...args[0],
    rules: {
      'ts/method-signature-style': 'off',
      'ts/consistent-type-imports': 'off',
      'ts/no-redeclare': 'off',
      'ts/no-namespace': 'off',
      ...(args[0] || {}).rules,
    },
  }, ...args.slice(1))
}

/**
 * Create a proxy to `naily.config.ts` for ESLint.
 *
 * @export
 * @return {Promise<ReturnType<typeof antfu>>}
 * @example
 * In `eslint.config.js`:
 *
 * ```js
 * import { nailyProxy } from '@nailyjs/eslint'
 *
 * export default await nailyProxy()
 * ```
 *
 * Then you can define eslint config in `naily.config.ts`:
 * ```ts
 * import { defineConfig } from '@nailyjs/config'
 *
 * export default defineConfig({
 *   naily: {
 *     eslint: {
 *       // Your eslint config here
 *     }
 *   }
 * })
 * ```
 */
export async function nailyProxy(): Promise<ReturnType<typeof antfu>> {
  return await new ESLintBootstrap()
    .use(ConfigPlugin())
    .run()
}

export default naily
