import { Value } from '@nailyjs/config'
import { Service } from '@nailyjs/ioc'
import { FSWatcher, watch } from 'chokidar'

@Service()
export class WatcherService {
  @Value('naily.cli.development.watchPaths')
  private readonly watchPath: string | string[]

  private _watcher: FSWatcher
  getWatcher(): FSWatcher {
    if (this._watcher) return this._watcher
    this._watcher = watch(this.watchPath || ['src', 'naily.config.ts'], {
      ignoreInitial: true,
    })
    return this._watcher
  }
}
