import path from 'node:path'
import { cwd, exit } from 'node:process'
import { Value } from '@nailyjs/config'
import { Autowired, Container, Service, Setupable, StartService } from '@nailyjs/ioc'
import { Compiler } from '../compilers/compiler.protocol'
import { TsupService } from '../compilers/tsup.service'
import { ViteService } from '../compilers/vite.service'
import { WatcherService } from '../watcher.service'

@Service()
export class DevelopmentStarter extends StartService implements Setupable {
  @Autowired(TsupService)
  private readonly tsupService: Compiler & TsupService

  @Autowired(ViteService)
  private readonly viteService: Compiler & ViteService

  @Autowired()
  private readonly watcherService: WatcherService

  @Value('naily.cli.development.using')
  private readonly _using: 'tsup' | 'vite'

  async setup(): Promise<void> {
    if (typeof this._using === 'string' && (this._using !== 'tsup' && this._using !== 'vite')) {
      console.error('Only tsup or vite is supported as a development tool for now.')
      return exit(0)
    }

    if (!this._using || this._using === 'tsup') {
      await this.tsupService.runDevelopmentMode()
      this.watcherService.getWatcher().on('all', async (ev, changedPath, stat) => {
        console.log(`File ${path.relative(cwd(), changedPath)} has been ${ev}`)
        if (this.tsupService.onWatch) await this.tsupService.onWatch(ev, changedPath, stat)
      })
    }
    else if (this._using === 'vite') {
      await this.viteService.setup()
    }
  }

  static getInstance(container: Container): DevelopmentStarter {
    return super.getInstance(container)
  }
}
