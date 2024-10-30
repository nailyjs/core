import k from 'kleur'

export class UnknownConstructorParamTypeError extends TypeError {
  constructor(paramType: any, targetName: string, index: number) {
    const message = `${k.red().underline().bold(paramType ? paramType.name ? paramType.name : paramType : 'undefined or null')} in ${k.yellow().underline().bold(targetName)} at constructor parameter index ${k.yellow().underline().bold(index)}.`
    super(message)
    this.message = message
  }

  logResolutions(): this {
    console.log()
    console.error(`${k.red().bold(`[${UnknownConstructorParamTypeError.name}]`)} ${this.message}`)
    console.log()
    console.log(`  ${k.dim('Possible resolutions:')}`)
    console.log(`  - Ensure that the type is ${k.bold().yellow(`imported and exported`)} correctly. If you are use ${k.bold().yellow('import type { SomeClass } from \'some-module\'')}, please remove the ${k.bold().yellow('type')} keyword and re-run the program, using import type may cause your bundler to tree-shaking your class, which will not be available at runtime.`)
    console.log(`  - Param type just available ${k.bold().yellow('class')} injection, ensure type ${k.bold().yellow('is not a interface or typing')}.`)
    console.log(`  - If your type must be a interface or typing, you can use ${k.bold().yellow('@Inject()')} or ${k.bold().yellow('@Autowired()')} decorator to inject the instance directly.`)
    console.log()
    return this
  }
}
