import { exit } from 'node:process'
import { Value } from '@nailyjs/config'
import { ClassWrapper, Container, Service, Setupable } from '@nailyjs/ioc'
import { TsupService } from './tsup.service'
import { LogoWriter } from './write-logo'

@Service()
export class ProductionStarter implements Setupable {
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
    return this.tsupService.setup()
  }

  static getInstance(container: Container): ProductionStarter {
    const wrapper = container.getContainer().get(ProductionStarter) as ClassWrapper<ProductionStarter>
    if (wrapper && wrapper.wrapperType === 'class') return wrapper.getClassFactory().getOrCreateInstance()
    return container.createClassWrapper(ProductionStarter).getClassFactory().getOrCreateInstance()
  }
}
