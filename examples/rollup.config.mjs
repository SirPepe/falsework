import alias from "@rollup/plugin-alias";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { babel } from "@rollup/plugin-babel";

const extensions = [".ts", ".js"];
const plugins = [
  alias({
    entries: [
      { find: "@sirpepe/falsework", replacement: "../dist/esm/index.js" },
    ],
  }),
  nodeResolve({ extensions }),
  babel({
    extensions,
    presets: [["@babel/preset-env", {}], "@babel/preset-typescript"],
    plugins: [["@babel/plugin-proposal-decorators", { version: "2023-05" }]],
    babelHelpers: "bundled",
    exclude: "node_modules/**",
  }),
];

export default [
  {
    input: "click-counter/src/main.ts",
    output: {
      file: "click-counter/lib/main.js",
    },
    plugins,
  },
];
