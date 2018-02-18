module.exports = function (buildConfig) {
  const styleLoader = {
    loader: 'style-loader',
    options: {
      hmr: buildConfig.isHMR(),
      sourceMap: !!buildConfig.getDevtool(),
    },
  };

  const postCSSLoader = {
    loader: 'postcss-loader',
    options: {
      modules: true,
      ident: 'postcss',
      plugins: [
        require('autoprefixer')(),
      ],
      sourceMap: !!buildConfig.getDevtool(),
    },
  };

  const cssLoader = {
    loader: 'css-loader',
    options: {
      minimize: buildConfig.isProduction(),
      url: false,
      importLoaders: 1,
      sourceMap: !!buildConfig.getDevtool(),
    },
  };

  const sassLoader = extraIncludePaths => ({
    loader: 'sass-loader',
    options: {
      includePaths: buildConfig.sassIncludePaths.concat(extraIncludePaths || []),
      sourceMap: !!buildConfig.getDevtool(),
      outputStyle: buildConfig.isProduction() ? 'compressed' : 'nested',
    },
  });

  const jsLoader = {
    loader: 'babel-loader',
    options: {
      cacheDirectory: true,
      presets: [
        [
          'env',
          {
            modules: false,
            targets: {
              browsers: ['> 2%'],
              uglify: buildConfig.isProduction(),
            },
          },
        ],
      ],
      plugins: [
        'transform-object-rest-spread',
        [
          'transform-runtime',
          {
            polyfill: false,
            helpers: false,
          },
        ],
      ],
    },
  };

  return {
    styleLoader,
    postCSSLoader,
    cssLoader,
    sassLoader,
    jsLoader,
  };
};
