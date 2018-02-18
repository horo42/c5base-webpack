const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const webpack = require('webpack');

module.exports = function (buildConfig) {
  const plugins = [];
  const extractors = [];

  const definePlugin = new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(buildConfig.isProduction() ? 'production' : 'development'),
  });

  const errorsPlugin = new FriendlyErrorsWebpackPlugin({
    clearConsole: true,
    compilationSuccessInfo: {
      messages: [ 'Successful build: http://localhost:3000' ],
      notes: [ 'Some additional notes to be displayed upon successful bundling' ]
    },
  });

  const extractCSS = new ExtractTextPlugin({
    filename: '[name].css',
    allChunks: true,
    disable: buildConfig.isHMR(),
  });

  const extractSASS = new ExtractTextPlugin({
    filename: '[name].css',
    allChunks: true,
    disable: buildConfig.isHMR(),
  });

  const providePlugin = new webpack.ProvidePlugin(buildConfig.providePlugins);

  plugins.push(definePlugin, errorsPlugin, providePlugin, extractCSS, extractSASS);
  extractors['extractCSS'] = extractCSS;
  extractors['extractSASS'] = extractSASS;

  if (buildConfig.isHMR()) {
    const hmrPlugin = new webpack.HotModuleReplacementPlugin();
    const namedModulesPlugin = new webpack.NamedModulesPlugin();

    plugins.push(hmrPlugin, namedModulesPlugin);
  }

  if (buildConfig.isWatch()) {
    const browserSyncPlugin = new BrowserSyncPlugin({
      host: 'localhost',
      port: 8080,
      proxy: browserSyncProxy,
      files: browserSyncWatch,
      snippetOptions: {
        rule: {
          match: /(<\/body>|<\/pre>)/i,
          fn: function (snippet, match) {
            return snippet + match;
          },
        },
      },
    }, {
      reload: false,
    });

    plugins.push(browserSyncPlugin);
  }

  if (buildConfig.enableNotifications) {
    let WebpackNotifierPlugin = require('webpack-notifier');

    plugins.push(new WebpackNotifierPlugin({
      title: 'Webpack',
      alwaysNotify: true,
      // contentImage: path.resolve(__dirname, 'node_modules/laravel-mix/icons/laravel.png')
    }));
  }

  return {
    plugins,
    extractors,
  };
};
