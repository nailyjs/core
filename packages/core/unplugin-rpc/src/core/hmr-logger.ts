import k from 'kleur'

let lastFilePaths: string | null = null
let count = 0

export function hmrLogger(filePath: string[]): void {
  function getTime(): string {
    return new Date().toLocaleTimeString()
  }

  const filePaths = filePath.join(', ')
  if (lastFilePaths === filePaths) {
    console.log(`${k.dim(getTime())} ${k.cyan().bold('[naily]')} ${k.green('Hot update')} ${k.dim(filePaths)} ${k.green(`(x${++count})`)}`)
    return
  }

  lastFilePaths = filePaths
  console.log(`${k.dim(getTime())} ${k.cyan().bold('[naily]')} ${k.green('Hot update')} ${k.dim(filePaths)}`)
}
