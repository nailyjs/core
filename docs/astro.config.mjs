import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Naily",
      social: {
        github: "https://github.com/withastro/starlight",
      },
      locales: {
        root: {
          label: "简体中文",
          lang: "zh-CN",
        },
      },
      sidebar: [
        {
          label: "快速上手",
          autogenerate: { directory: "guides" },
        },
        {
          label: "插件与启动器",
          autogenerate: { directory: "plugins" },
        },
      ],
    }),
  ],
});
