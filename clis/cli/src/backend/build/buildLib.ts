import { sync } from "glob";
import { extname, relative } from "path";
import { RollupBuild, rollup } from "rollup";
import swc from "@rollup/plugin-swc";
import commonjs from "@rollup/plugin-commonjs";
import buildDts from "./buildDts";
import { Listr } from "listr2";

interface Ctx {
  rollupBuild: RollupBuild;
}

export default function build() {
  return new Listr<Ctx>(
    [
      {
        title: "Build d.ts",
        task: async () => {
          await buildDts();
        },
      },
      {
        title: "Start rollup building",
        task: async (ctx, task) => {
          const paths = [];
          const input = Object.fromEntries(
            sync("src/**/*.ts", { absolute: true }).map((file) => {
              paths.push(file);
              return [
                // 这里将删除 `src/` 以及每个文件的扩展名。
                // 因此，例如 src/nested/foo.js 会变成 nested/foo
                relative("src", file.slice(0, file.length - extname(file).length)),
                // 这里可以将相对路径扩展为绝对路径，例如
                // src/nested/foo 会变成 /project/src/nested/foo.js
                file,
              ];
            }),
          );
          ctx.rollupBuild = await rollup({
            input,
            plugins: [swc(), commonjs()],
            external(id) {
              if (paths.includes(id)) return false;
              return true;
            },
            logLevel: "silent",
          });

          return task.newListr(
            [
              {
                title: "Build esm",
                task: async () => {
                  const { rollupBuild } = ctx;
                  await rollupBuild.write({
                    format: "esm",
                    dir: "lib/esm",
                    sourcemap: "inline",
                    entryFileNames: "[name].mjs",
                  });
                },
              },
              {
                title: "Build cjs",
                task: async () => {
                  const { rollupBuild } = ctx;
                  await rollupBuild.write({
                    format: "cjs",
                    dir: "lib/cjs",
                    sourcemap: "inline",
                    entryFileNames: "[name].js",
                  });
                },
              },
            ],
            { concurrent: true },
          );
        },
      },
    ],
    { concurrent: true },
  ).run();
}
