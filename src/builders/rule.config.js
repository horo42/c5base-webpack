module.exports = function (loaders, sassExcludes, extractors) {
  return [
    {
      test: /\.css$/,
      use: extractors.extractCSS.extract({
        fallback: loaders.styleLoader,
        use: [ loaders.cssLoader, loaders.postCSSLoader ],
      }),
    },
    {
      test: /\.s[ac]ss$/,
      use: extractors.extractSASS.extract({
        fallback: loaders.styleLoader,
        use: [ loaders.cssLoader, loaders.postCSSLoader, loaders.sassLoader() ],
      }),
      exclude: sassExcludes,
    },
    {
      test: /\.js$/,
      use: loaders.jsLoader,
      exclude: /(node_modules|bower_components)/,
    }
  ];
};
