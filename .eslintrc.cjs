/** @type {import("eslint").Linter.Config} */
module.exports = {
  plugins: ["@typescript-eslint/eslint-plugin"],
  extends: ["plugin:@typescript-eslint/recommended", "plugin:prettier/recommended"],
  root: true,
  env: {
    node: true,
  },
  ignorePatterns: [".eslintrc.cjs"],
};
