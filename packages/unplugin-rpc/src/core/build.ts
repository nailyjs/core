import path from 'node:path'
import { cwd } from 'node:process'
import defu from 'defu'
import { build, mergeConfig, UserConfig } from 'vite'
import { Options } from '../types'
import swc, { defaultSwcOptions } from './swc'

export async function buildServer(options?: Options | undefined): Promise<void> {
  const serverEntry = (options || {}).serverEntry || path.join(cwd(), './backend/main.ts')
  const viteOptions = ((options || {}).build || {}).viteOptions || {}
  const swcOptions = ((options || {}).build || {}).swcOptions || {}

  await build(mergeConfig({
    build: {
      ssr: serverEntry,
      ssrManifest: true,
      outDir: 'dist/backend',
    },

    plugins: [
      swc.vite(defu(swcOptions, defaultSwcOptions)),
    ],
  } as UserConfig, viteOptions))
}
