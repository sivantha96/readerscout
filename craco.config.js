const CracoEnvPlugin = require("craco-plugin-env");

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      return {
        ...webpackConfig,
        entry: {
          main: [
            env === "development" &&
              require.resolve("react-dev-utils/webpackHotDevClient"),
            paths.appIndexJs,
          ].filter(Boolean),
          background: "./src/chrome/background.ts",
        },
        output: {
          ...webpackConfig.output,
          filename: (pathData) => {
            return pathData.chunk.name === "background"
              ? "[name].js"
              : "static/js/[name].js";
          },
        },
        optimization: {
          ...webpackConfig.optimization,
          runtimeChunk: false,
        },
      };
    },
  },
  plugins: [
    {
      plugin: CracoEnvPlugin,
      options: {
        variables: {},
      },
    },
  ],
};
