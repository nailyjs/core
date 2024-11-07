import fs from 'node:fs'
import path from 'node:path'
import { cwd } from 'node:process'
import { JexlExecutor } from '@nailyjs/config'
import { Service } from '@nailyjs/ioc'

export namespace PackageFileService {
  export type Type = 'module' | 'commonjs'
}

@Service()
export class PackageFileService {
  constructor(private readonly jexlExecutor: JexlExecutor) {}

  private _packageFile: Record<string, any> | null = null
  readPackageFile(cache: boolean = true): Record<string, any> {
    if (this._packageFile && cache) return this._packageFile
    if (fs.existsSync(path.join(cwd(), 'package.json')))
      this._packageFile = JSON.parse(fs.readFileSync(path.join(cwd(), 'package.json'), 'utf-8'))
    return this._packageFile || {}
  }

  execute<Expression extends string>(expression: Expression): any {
    return this.jexlExecutor.evalSync(expression, this.readPackageFile())
  }

  getType(): PackageFileService.Type | undefined {
    return this.execute('type')
  }

  getMain(): string | undefined {
    return this.execute('main')
  }
}
