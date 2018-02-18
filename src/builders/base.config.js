const path = require('path');

module.exports = function (buildConfig) {
  return {
    context: buildConfig.rootPath,
    entry: {},
    output: {
      path: buildConfig.outputPath,
      filename: '[name].js',
      chunkFilename: '[name].js',
      publicPath: '',
    },
    devtool: false,
    module: {
      rules: [],
    },
    plugins: [],
    stats: {
      hash: false,
      version: false,
      timings: false,
      children: false,
      errorDetails: false,
      chunks: false,
      modules: false,
      reasons: false,
      source: false,
      publicPath: false,
    },
    devServer: {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      contentBase: buildConfig.rootPath,
      historyApiFallback: true,
      noInfo: true,
      compress: true,
      quiet: true,
    },
    resolve: {
      extensions: [ '*', '.js', '.json' ],
      alias: {
        // 'Packages': path.resolve(__dirname, buildConfig.rootPath, 'packages/'),
        // 'SpecificImport$': path.resolve(__dirname, buildConfig.rootPath, 'packages/specific-file.js'),
      },
    },
    resolveLoader: {
      modules: [path.resolve(__dirname, '../../node_modules'), 'node_modules'],
    },
  };
};
