import { sync } from "glob";
import { extname, relative } from "path";
import { RollupBuild, rollup } from "rollup";
import swc from "@rollup/plugin-swc";
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import buildDts from "./buildDts";
import { Listr } from "listr2";
import { isEsm } from "../utils/isEsm";

interface Ctx {
  rollupBuild: RollupBuild;
}

export default function build(exitOnError = true) {
  return new Listr<Ctx>(
    [
      {
        title: "Type check",
        exitOnError,
        task: async () => {
          await buildDts(".naily/dist/types", true);
        },
      },
      {
        title: "Rollup with swc build",
        task: async (ctx, task) => {
          const paths = [];
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
          });
          ctx.rollupBuild = await rollup({
            input: "./src/main.ts",
            plugins: [
              swc(),
              commonjs(),
              terser(),
              nodeResolve({
                extensions: [".mjs", ".node", ".ts", ".js", ".json"],
                moduleDirectories: [],
              }),
            ],
            logLevel: "silent",
          });
          if (isEsm()) {
            return task.newListr(
              [
                {
                  title: "Build esm",
                  task: async () => {
                    const { rollupBuild } = ctx;
                    await rollupBuild.write({
                      format: "esm",
                      file: ".naily/dev/esm/bundle.mjs",
                      sourcemap: "inline",
                    });
                  },
                },
              ],
              { concurrent: true, exitOnError, collectErrors: "full", rendererOptions: { collapseErrors: false } },
            );
          } else {
            return task.newListr(
              [
                {
                  title: "Build cjs",
                  task: async () => {
                    const { rollupBuild } = ctx;
                    await rollupBuild.write({
                      format: "cjs",
                      file: ".naily/dev/cjs/bundle.cjs",
                      sourcemap: "inline",
                    });
                  },
                },
              ],
              { concurrent: true, exitOnError, collectErrors: "full", rendererOptions: { collapseErrors: false } },
            );
          }
        },
      },
    ],
    { concurrent: true, exitOnError, collectErrors: "full", rendererOptions: { collapseErrors: false } },
  ).run();
}
