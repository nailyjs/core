import path from 'node:path'
import { Value } from '@nailyjs/config'
import { Service, Setupable } from '@nailyjs/ioc'
import defu from 'defu'
import * as tsup from 'tsup'
import { EntryAnalyzerService } from './entry-analyzer.service'
import { PackageFileService } from './package-file.service'

@Service()
export class TsupService implements Setupable {
  constructor(
    private readonly entryAnalyzerService: EntryAnalyzerService,
    private readonly packageFileService: PackageFileService,

    @Value('naily.cli.development.tsup')
    private readonly _devTsup: tsup.Options,

    @Value('naily.cli.build.tsup')
    private readonly _buildTsup: tsup.Options,

    @Value('naily.cli.development.runnerEntry')
    private readonly _runnerEntry: string,
  ) {}

  private getDefaultFormat(): tsup.Options['format'] {
    const packageType = this.packageFileService.getType()

    if (!packageType) return ['cjs', 'esm']
    else if (packageType === 'module') return 'esm'
    else return 'cjs'
  }

  private getDefaultConfiguration(): tsup.Options {
    return {
      entry: this.entryAnalyzerService.getEntry(),
      format: this.getDefaultFormat(),
      dts: false,
      sourcemap: true,
      minify: false,
      clean: true,
      publicDir: true,
    }
  }

  getMergedConfiguration(mode: 'build' | 'dev'): tsup.Options {
    return defu(mode === 'dev' ? this._devTsup : this._buildTsup, this.getDefaultConfiguration())
  }

  getOutDir(mode: 'build' | 'dev' = 'dev'): string {
    return path.resolve(this.getMergedConfiguration(mode).outDir || 'dist')
  }

  getRunnerEntry(mode: 'build' | 'dev'): string {
    if (this._runnerEntry) return path.resolve(this._runnerEntry)
    const mergedConfiguration = this.getMergedConfiguration(mode)
    if (Array.isArray(mergedConfiguration.entry)) return path.resolve(mergedConfiguration.entry[0] || '')
    else return path.resolve(Object.values(mergedConfiguration.entry)[0] || '')
  }

  async setup(mode: 'build' | 'dev'): Promise<void> {
    return await tsup.build(this.getMergedConfiguration(mode))
  }
}
