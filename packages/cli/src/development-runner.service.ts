import child_process from 'node:child_process'
import path from 'node:path'
import { stderr, stdout } from 'node:process'
import { Service } from '@nailyjs/ioc'

@Service()
export class DevelopmentRunnerService {
  createProcess(filePath: string): () => boolean {
    const resolvedFilePath = path.resolve(filePath)
    const forked = child_process.spawn('node', [resolvedFilePath])

    const forkStdout = forked.stdout?.pipe(stdout)
    const forkStderr = forked.stderr?.pipe(stderr)

    function killer(signal: NodeJS.Signals | number = 2): boolean {
      forkStdout?.unpipe(stdout)
      forkStderr?.unpipe(stderr)
      return forked.kill(signal)
    }

    return killer
  }
}
