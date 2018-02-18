if (global.config) {
    module.exports = global.config;
}

class Config {
    constructor() {
        this.rootPath = '../../';

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
}

global.config = new Config();
module.exports = global.config;
