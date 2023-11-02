/* eslint-env node */

const config = {
  presets: [["@babel/preset-env", {}], "@babel/preset-typescript"],
  plugins: [
    [
      "@babel/plugin-proposal-decorators",
      {
        version: "2023-05",
      },
    ],
  ],
};

export default config;
