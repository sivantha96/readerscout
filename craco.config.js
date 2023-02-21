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
          content: "./src/chrome/content.ts",
        },
        output: {
          ...webpackConfig.output,
          filename: (pathData) => {
            return pathData.chunk.name === "background" ||
              pathData.chunk.name === "content"
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
};
