import { defineProject } from "vitest/config";
import swc from "unplugin-swc";
import alias from "vite-tsconfig-paths";

// noinspection JSUnusedGlobalSymbols
export default defineProject({
  plugins: [
    swc.vite({
      module: { type: "es6" },
    }),
    alias(),
  ],
  test: {
    exclude: ["**/node_modules/**", "*.mjs", "*.cjs", "**/lib/**"],
    globals: true,
  },
});
