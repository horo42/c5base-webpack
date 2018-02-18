const path = require('path');
const glob = require('glob');
const fs = require('fs');
const chalk = require('chalk');

module.exports = function (buildConfig, loaders, sassExcludes, extractors) {
  const entries = {};
  const rules = [];

  const pkgArg = buildConfig.getPackage();
  const themeArg = buildConfig.getTheme();
  let themesPath = path.resolve(buildConfig.rootPath, 'application/themes');
  let themes = [];

  // PACKAGES

  let packageAssetsPath = buildConfig.rootPath + 'packages/*/src/Resources/assets/index.js';
  if (buildConfig.isProduction() && !buildConfig.alwaysBuildFromPackages) {
    packageAssetsPath = buildConfig.rootPath + 'application/assets/packages/*/index.js';
  }

  // TODO: remove
  packageAssetsPath = buildConfig.rootPath + 'application/assets/packages/*/index.js';

  const packageAssets = glob.sync(path.resolve(__dirname, packageAssetsPath)).map(path => ({
    name: path.match(packageAssetsPath.replace('*', '([^/]+)'))[1],
    path,
  }));

  // THEMES

  let testPkgPath = path.resolve(__dirname, buildConfig.rootPath, `packages/${pkgArg}/themes`);
  if (pkgArg && fs.existsSync(testPkgPath)) {
    themesPath = testPkgPath;
    console.error(chalk.bold.green(`Using ${themesPath} package path`));
  } else {
    console.error(chalk.bold.yellow(`Using default ${themesPath} package path`));
  }

  let testThemePath = path.resolve(__dirname, buildConfig.rootPath, themesPath + '/' + themeArg);
  if (themeArg && fs.existsSync(testThemePath)) {
    themes = [ testThemePath ];
  }

  if (!themes.length) {
    if (!fs.existsSync(themesPath)) {
      console.error(chalk.bold.red(`Package path ${themesPath} not found`));
      process.exit();
    }

    const themeDirs = fs.readdirSync(themesPath);
    themes = themeDirs
      .filter(entry => !buildConfig.ignoredFiles.includes(entry))
      .map(entry => ({ name: entry, path: themesPath + '/' + entry }));

    if (!themes.length) {
      console.error(chalk.bold.red(`No themes found in ${themesPath}`));
      process.exit();
    }
  }

  for (let theme of themes) {
    entries[theme.name] = [ theme.path + '/assets/js/index.js', theme.path + '/assets/stylesheets/main.scss' ]
      .concat(packageAssets.map(pA => pA.path));

    // TODO: create rule generator function with smart merging of options
    rules.push({
      test: new RegExp(theme.path + '.*\.s[ac]ss$'),
      use: extractors.extractSASS.extract({
        fallback: loaders.styleLoader,
        use: [ loaders.cssLoader, loaders.postCSSLoader, loaders.sassLoader(theme.path + '/assets/stylesheets/_defaults') ],
      }),
    });

    sassExcludes.push(theme.path + '/assets/stylesheets/main.scss');
  }

  return {
    entries,
    rules,
  };
};
