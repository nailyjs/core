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

export async function nailyProxy(): Promise<ReturnType<typeof antfu>> {
  return await new ESLintBootstrap()
    .use(ConfigPlugin())
    .run()
}

export default naily
