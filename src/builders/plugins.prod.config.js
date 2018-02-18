const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const webpack = require('webpack');

module.exports = function (buildConfig) {
  const plugins = [];

  const uglifyPlugin = new UglifyJsPlugin({
    test: /\.js($|\?)/,
    parallel: 4,
    sourceMap: true,
  });

  const scopeHoistingPlugin = new webpack.optimize.ModuleConcatenationPlugin();

  const optimizeCssPlugin = new OptimizeCssAssetsPlugin({
    // assetNameRegExp: /\.css$/i,
    cssProcessor: require('cssnano'),
    cssProcessorOptions: {
      discardComments: {
        removeAll: true,
      },
      map: {
        inline: !buildConfig.isProduction(),
      },
    },
    canPrint: true,
  });

  plugins.push(uglifyPlugin, scopeHoistingPlugin, optimizeCssPlugin);

  return plugins;
};
