import { exit } from 'node:process'
import { Value } from '@nailyjs/config'
import { ClassWrapper, Container, Service, Setupable } from '@nailyjs/ioc'
import { TsupService } from '../compilers/tsup.service'
import { LogoWriter } from '../write-logo'

@Service()
export class BuildStarter implements Setupable {
  constructor(
    private readonly tsupService: TsupService,
    private readonly logoWriter: LogoWriter,
    @Value('naily.cli.build.using')
    private readonly _using: 'tsup' | 'vite',
  ) {}

  private refreshScreen(): void {
    console.clear()
    this.logoWriter.write()
  }

  async setup(): Promise<void> {
    if (typeof this._using === 'string' && this._using !== 'tsup') {
      console.error('Only tsup is supported as a development tool for now.')
      return exit(0)
    }

    this.refreshScreen()
    return this.tsupService.setup('build')
  }

  static getInstance(container: Container): BuildStarter {
    const wrapper = container.getContainer().get(BuildStarter) as ClassWrapper<BuildStarter>
    if (wrapper && wrapper.wrapperType === 'class') return wrapper.getClassFactory().getOrCreateInstance()
    return container.createClassWrapper(BuildStarter).save().getClassFactory().getOrCreateInstance()
  }
}
