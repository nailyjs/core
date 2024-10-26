import { exec } from 'node:child_process'
import { stderr, stdout } from 'node:process'
import { scripts } from '../package.json'

for (const [name, _script] of Object.entries(scripts)) {
  if (!name.startsWith('build:')) continue

  const child_process = exec(`pnpm run ${name}`)
  child_process.stdout?.pipe(stdout)
  child_process.stderr?.pipe(stderr)
}
