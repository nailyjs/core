import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import { ModuleKind, ModuleResolutionKind, ScriptTarget } from 'typescript'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Naily',
  description: 'Simple,extensible IOC framework for TypeScript.',

  markdown: {
    codeTransformers: [
      transformerTwoslash({
        explicitTrigger: true,
        twoslashOptions: {
          compilerOptions: {
            target: ScriptTarget.ES2022,
            module: ModuleKind.ES2022,
            moduleResolution: ModuleResolutionKind.Bundler,
          },
        },
      }),
    ],
  },

  locales: {
    root: {
      label: '简体中文',
      lang: 'zh',
    },
    en: {
      label: 'English',
      lang: 'en',
    },
  },

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      {
        text: '指南',
        items: [
          { text: 'RPC指南', link: '/rpc-guide' },
        ],
      },
    ],

    sidebar: [
      {
        text: 'RPC指南',
        items: [
          { text: '开始使用', link: '/rpc-guide' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'npm', link: 'https://www.npmjs.com/org/nailyjs' },
      { icon: 'github', link: 'https://github.com/nailyjs/core' },
    ],
  },

  vite: {
    plugins: [
      UnoCSS(),
    ],
  },
})
