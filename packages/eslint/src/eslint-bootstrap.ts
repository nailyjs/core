import antfu from '@antfu/eslint-config'
import { Value } from '@nailyjs/config'
import { AbstractBootstrap, ClassWrapper, Container, Injectable } from '@nailyjs/ioc'

@Injectable()
export class EslintService {
  constructor(
    @Value('naily.eslint')
    private readonly value: Naily.Configuration.NailyUserConfig['eslint'],
  ) {}

  getEslintConfig(): Parameters<typeof antfu> {
    return [
      (this.value || {}),
      ...((this.value || {}).extraOptions || []),
    ]
  }

  static getInstance(container: Container): EslintService {
    const wrapper = container.getContainer().get(EslintService) as ClassWrapper<EslintService>
    if (!wrapper) return container.createClassWrapper(EslintService).getClassFactory().getOrCreateInstance()
    return wrapper.getClassFactory().getOrCreateInstance()
  }
}

export class ESLintBootstrap extends AbstractBootstrap {
  async run(): Promise<ReturnType<typeof antfu>> {
    await this.getPluginRunner().runBeforeRun()
    const args = EslintService.getInstance(this).getEslintConfig()

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
}
