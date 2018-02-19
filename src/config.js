const path = require('path');
const glob = require('glob');
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

    this.sassIncludePaths = [];
    this.additionalCSS = [];
    this.additionalJS = [];
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

    return this;
  }

  withTypescript() {
    this.enableTypescript = true;

    return this;
  }

  withVue() {
    this.enableVue = true;

    return this;
  }

  withNotifications() {
    this.enableNotifications = true;

    return this;
  }

  buildFromPackages() {
    this.alwaysBuildFromPackages = true;

    return this;
  }

  provide(pluginKey, pluginName) {
    this.providePlugins[pluginKey] = pluginName;

    return this;
  }

  bsProxy(host) {
    this.browserSyncProxy = host;

    return this;
  }

  bsAddWatch(path) {
    this.browserSyncWatch.push(this.rootPath + path);

    return this;
  }

  addSassInclude(path) {
    this.sassIncludePaths.push(path);

    return this;
  }

  outputTo(outputPath) {
    this.outputPath = path.resolve(this.rootPath, outputPath);

    return this;
  }

  addCSS(...files) {
    if (files.length == 1 && Array.isArray(files[0])) {
      files = files[0];
    }

    files = files.reduce((files, path) => {
      files.push(...glob.sync(path));
      return files;
    }, []);

    this.additionalCSS.push(...files);

    return this;
  }

  addJS(...files) {
    if (files.length == 1 && Array.isArray(files[0])) {
      files = files[0];
    }

    files = files.reduce((files, path) => {
      files.push(...glob.sync(path));
      return files;
    }, []);

    this.additionalJS.push(...files);

    return this;
  }
}

global.config = new Config();
module.exports = global.config;
