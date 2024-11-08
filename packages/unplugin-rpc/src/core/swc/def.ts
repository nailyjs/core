import type { SwcOptions } from './index'

export const defaultSwcOptions: SwcOptions = {
  jsc: {
    parser: {
      syntax: 'typescript',
      decorators: true,
      tsx: true,
    },

    transform: {
      decoratorMetadata: true,
      legacyDecorator: true,
    },
  },
}
