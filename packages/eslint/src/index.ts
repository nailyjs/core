import antfu from '@antfu/eslint-config'

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

export default naily
