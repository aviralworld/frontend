module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  plugins: ["@typescript-eslint", "svelte3"],
  rules: {
    // copied from
    // <https://dev.to/mhaecker/use-airbnb-s-eslint-config-with-typescript-prettier-in-svelte-apps-4fb7>,
    // should review
    // "import/no-extraneous-dependencies": ["error", { devDependencies: true }],
    // "import/no-mutable-exports": 0,
    // "no-labels": 0,
    // "no-restricted-syntax": 0,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:eslint-comments/recommended",
    "plugin:promise/recommended",
    "prettier",
    "prettier/@typescript-eslint",
  ],
  overrides: [
    {
      files: ["**/*.svelte"],
      processor: "svelte3/svelte3",
      rules: {
        // according to the docs, these don't work well with Svelte
        "import/first": "off",
        "import/no-duplicates": "off",
        "import/no-mutable-exports": "off",
        "import/no-unresolved": "off",
      },
      plugins: ["@typescript-eslint"],
    },
  ],
};
