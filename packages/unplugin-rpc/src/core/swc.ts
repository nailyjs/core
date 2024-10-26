import type { PluginOption } from 'vite'
import defu from 'defu'
import * as swcPlugin from 'unplugin-swc'

export function swc(mixed?: swcPlugin.Options): PluginOption {
  const options = defu(mixed || {}, {
    jsc: {
      transform: {
        legacyDecorator: true,
        decoratorMetadata: true,
        decoratorVersion: '2021-12',
      },
      parser: {
        syntax: 'typescript',
        decorators: true,
        tsx: true,
      },
    },
  } as swcPlugin.Options)

  return ((swcPlugin.default as any).default as any).vite(options)
}
