import { defineConfig } from "vitest/config";

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
  test: {
    coverage: {
      provider: "istanbul", // or 'v8',
      enabled: true,
      reporter: ["text", "html", "clover", "json"],
      exclude: ["**/node_modules/**", "*.mjs", "*.cjs", "**/lib/**"],
    },
    globals: true,
  },
});
