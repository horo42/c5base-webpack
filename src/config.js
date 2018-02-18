const path = require('path');
const argv = require('yargs').argv;

if (global.config) {
  module.exports = global.config;
}

class Config {
  constructor() {
    this.rootPath = path.resolve(__dirname, '../../../');
    this.outputPath = this.rootPath;

    this.ignoredFiles = [ '.gitignore', '.DS_Store', '.gitkeep' ];

    this.enableTypescript = false;
    this.enableVue = false;
    this.enableNotifications = false;
    this.sourcemapsInProduction = true;
    this.alwaysBuildFromPackages = false;

    this.providePlugins = {
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      'Popper': 'popper.js',
      Vue: 'vue',
    };

    this.browserSyncProxy = 'app.dev';
    this.browserSyncWatch = [
      this.rootPath + 'packages/**/*',
      this.rootPath + 'application/**/*',
    ];

    this.sassIncludePaths = [
      // path.resolve(rootPath + themePath + '/assets/stylesheets/_defaults'),
    ];
  }

  isProduction() {
    return process.env.NODE_ENV === 'production' || process.argv.includes('-p');
  }

  isHMR() {
    return process.argv.includes('--hot');
  }

  isWatch() {
    return process.argv.includes('--watch');
  }

  getDevtool() {
    return this.isProduction() ? (this.sourcemapsInProduction ? 'cheap-source-map' : false) : 'inline-source-map';
  }

  getPackage() {
    return argv.env && argv.env.package;
  }

  getTheme() {
    return argv.env && argv.env.theme;
  }

  ignore(file) {
    this.ignoredFiles.push(file);
  }

  withTypescript() {
    this.enableTypescript = true;
  }

  withVue() {
    this.enableVue = true;
  }

  withNotifications() {
    this.enableNotifications = true;
  }

  buildFromPackages() {
    this.alwaysBuildFromPackages = true;
  }

  provide(pluginKey, pluginName) {
    this.providePlugins[pluginKey] = pluginName;
  }

  bsProxy(host) {
    this.browserSyncProxy = host;
  }

  bsAddWatch(path) {
    this.browserSyncWatch.push(this.rootPath + path);
  }

  addSassInclude(path) {
    this.sassIncludePaths.push(path);
  }

  outputTo(outputPath) {
    this.outputPath = path.resolve(this.rootPath, outputPath);
  }
}

global.config = new Config();
module.exports = global.config;
