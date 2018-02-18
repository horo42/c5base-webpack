const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = function (buildConfig) {
  const extractVUE = new ExtractTextPlugin({
    filename: '[name].css',
    allChunks: true,
    disable: buildConfig.isHMR(),
  });

  const vueLoader = {
    loader: 'vue-loader',
    options: {
      loaders: {
        js: {
          loader: 'babel-loader',
        },
        scss: extractVUE.extract({
          use: 'css-loader!sass-loader',
          fallback: 'vue-style-loader'
        }),
        sass: extractVUE.extract({
          use: 'css-loader!sass-loader',
          fallback: 'vue-style-loader'
        }),
        css: extractVUE.extract({
          use: 'css-loader',
          fallback: 'vue-style-loader'
        }),
      },
    },
  };

  const rule = {
    test: /\.vue$/,
    loader: vueLoader,
    exclude: /bower_components/,
  };

  return {
    plugin: extractVUE,
    rule,
    extensions: ['.vue']
  };
};
