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

  const packageAssets = glob.sync(packageAssetsPath).map(path => ({
    name: path.match(packageAssetsPath.replace('*', '([^/]+)'))[1],
    path,
  }));

  // THEMES

  let testPkgPath = path.resolve(buildConfig.rootPath, `packages/${pkgArg}/themes`);
  if (pkgArg && fs.existsSync(testPkgPath)) {
    themesPath = testPkgPath;
    console.error(chalk.bold.green(`Using ${themesPath} package path`));
  } else {
    console.error(chalk.bold.yellow(`Using default ${themesPath} package path`));
  }

  let testThemePath = path.resolve(buildConfig.rootPath, themesPath + '/' + themeArg);
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

  if (themes.length > 1) {
    console.error(chalk.bold.red('More than 1 theme found, bundling multiple themes not supported yet.'));
  }

  // ASSEMBLING ENTRYPOINT
  const theme = themes[0];

  entries[theme.name] = [ theme.path + '/assets/js/index.js', theme.path + '/assets/stylesheets/main.scss' ]
    .concat(packageAssets.map(pA => pA.path))
    .concat(buildConfig.additionalCSS)
    .concat(buildConfig.additionalJS);

  buildConfig.addSassInclude(theme.path + '/assets/stylesheets/_defaults');

  // rules.push({
  //   test: new RegExp(theme.path + '.*\.s[ac]ss$'),
  //   use: extractors.extractSASS.extract({
  //     fallback: loaders.styleLoader,
  //     use: [ loaders.cssLoader, loaders.postCSSLoader, loaders.sassLoader(theme.path + '/assets/stylesheets/_defaults') ],
  //   }),
  // });

  // sassExcludes.push(theme.path + '/assets/stylesheets/main.scss');

  return {
    entries,
    rules,
  };
};
