module.exports = function () {
  const loader = {
    loader: 'ts-loader',
    options: {
      appendTsSuffixTo: [/\.vue$/],
    }
  };

  const rule = {
    test: /\.tsx?$/,
    loader: loader,
    exclude: /node_modules/,
  };

  const extensions = ['.ts', '.tsx'];

  return {
    rule,
    extensions,
  };
};
