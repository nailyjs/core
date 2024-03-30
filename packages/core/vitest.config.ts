import { defineProject } from "vitest/config";
import swc from "@rollup/plugin-swc";
import alias from "vite-tsconfig-paths";
import AST from "unplugin-ast";
import { Reflection } from "@nailyjs/reflection";

// noinspection JSUnusedGlobalSymbols
export default defineProject({
  plugins: [
    AST.rollup({
      transformer: Reflection,
    }),
    swc({
      swc: {
        jsc: {
          target: "es2015",
          transform: {
            decoratorVersion: "2022-03",
          },
        },
      },
    }),
    alias(),
  ],
  test: {
    exclude: ["**/node_modules/**", "*.mjs", "*.cjs", "**/lib/**"],
    globals: true,
  },
});
