import type { Stats } from 'node:fs'
import { Setupable } from '@nailyjs/ioc'

export interface Compiler extends Setupable {
  onWatch?(
    ev: string,
    changedPath: string,
    stat: Stats,
  ): void | Promise<void>
}
