import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Naily",
      customCss: ["./src/styles/global.less"],
      social: {
        github: "https://github.com/nailyjs",
      },
      defaultLocale: "root",
      locales: {
        root: {
          label: "简体中文",
          lang: "zh-CN",
        },
        en: {
          label: "English",
          lang: "en",
        },
      },
      sidebar: [
        {
          label: "指南",
          translations: {
            en: "Guides",
          },
          autogenerate: { directory: "guides" },
        },
        {
          label: "API参考",
          translations: {
            en: "API Reference",
          },
          autogenerate: { directory: "reference" },
        },
      ],
    }),
  ],
});
