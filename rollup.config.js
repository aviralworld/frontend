import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import commonjs from "@rollup/plugin-commonjs";
import svelte from "rollup-plugin-svelte";
import babel from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";
import sveltePreprocess from "svelte-preprocess";
import typescript from "@rollup/plugin-typescript";
import prettierPlugin from "rollup-plugin-prettier";
import config from "sapper/config/rollup.js";
import pkg from "./package.json";
import dotenvSafe from "dotenv-safe";
dotenvSafe.config({
  path: process.env.DOTENV_FILE,
});

const mode = process.env.NODE_ENV;
const dev = mode === "development";
const legacy = !!process.env.SAPPER_LEGACY_BUILD;

const TYPESCRIPT_SETTINGS = {
  tsconfigFile: dev ? "./tsconfig.json" : "./tsconfig.production.json",
};

const onwarn = (warning, onwarn) =>
  (warning.code === "MISSING_EXPORT" && /'preload'/.test(warning.message)) ||
  (warning.code === "CIRCULAR_DEPENDENCY" &&
    /[/\\]@sapper[/\\]/.test(warning.message)) ||
  warning.code === "THIS_IS_UNDEFINED" ||
  onwarn(warning);

export default {
  client: {
    input: config.client.input().replace(/.js$/, ".ts"),
    output: config.client.output(),
    plugins: [
      replace({
        values: {
          "process.browser": true,
          "process.env.NODE_ENV": JSON.stringify(mode),
        },
        preventAssignment: true,
      }),
      svelte({
        dev,
        hydratable: true,
        preprocess: sveltePreprocess({ typescript: TYPESCRIPT_SETTINGS }),
        emitCss: true,
      }),
      resolve({
        browser: true,
        dedupe: ["svelte"],
      }),
      commonjs(),
      typescript({ sourceMap: dev }),

      legacy &&
        babel({
          extensions: [".js", ".mjs", ".html", ".svelte"],
          babelHelpers: "runtime",
          exclude: ["node_modules/@babel/**"],
          presets: [
            [
              "@babel/preset-env",
              {
                targets: "> 0.25%, not dead",
              },
            ],
          ],
          plugins: [
            "@babel/plugin-syntax-dynamic-import",
            [
              "@babel/plugin-transform-runtime",
              {
                useESModules: true,
              },
            ],
          ],
        }),

      !dev &&
        terser({
          mangle: false,
          compress: false,
          module: true,
        }),

      !dev && prettierPlugin(),
    ],

    preserveEntrySignatures: false,
    onwarn,
  },

  server: {
    input: { server: config.server.input().server.replace(/.js$/, ".ts") },
    output: config.server.output(),
    plugins: [
      replace({
        values: {
          "process.browser": false,
          "process.env.NODE_ENV": JSON.stringify(mode),
        },
        preventAssignment: true,
      }),
      svelte({
        generate: "ssr",
        hydratable: true,
        preprocess: sveltePreprocess({ typescript: TYPESCRIPT_SETTINGS }),
        dev,
      }),
      resolve({
        dedupe: ["svelte"],
      }),
      commonjs(),
      typescript({ sourceMap: dev }),
    ],
    external: Object.keys(pkg.dependencies).concat(
      require("module").builtinModules,
    ),

    preserveEntrySignatures: "strict",
    onwarn,
  },
};
