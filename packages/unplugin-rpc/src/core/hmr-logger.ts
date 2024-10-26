import { cyan, dim, green } from 'kleur'

let lastFilePaths: string | null = null
let count = 0

export function hmrLogger(filePath: string[]): void {
  function getTime(): string {
    return new Date().toLocaleTimeString()
  }

  const filePaths = filePath.join(', ')
  if (lastFilePaths === filePaths) {
    console.log(`${dim(getTime())} ${cyan().bold('[naily]')} ${green('Hot update')} ${dim(filePaths)} ${green(`(x${++count})`)}`)
    return
  }

  lastFilePaths = filePaths
  console.log(`${dim(getTime())} ${cyan().bold('[naily]')} ${green('Hot update')} ${dim(filePaths)}`)
}
