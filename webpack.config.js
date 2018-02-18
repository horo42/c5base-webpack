const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const argv = require('yargs').argv;
const webpack = require('webpack');
const path = require('path');
const glob = require('glob');
const fs = require('fs');
const chalk = require('chalk');

/******************************
 *
 * CONFIGURATION
 *
 */

const configFilename = 'c5base.config.js';

let configPath = '../../' + configFilename;
if (!fs.existsSync(path.resolve(__dirname, configPath))) {
    console.error(chalk.bold.yellow(`No ${configFilename} file found in project root, using default config...`));
    configPath = './default.config.js';
}

require(configPath);
const buildConfig = require('./index.js');

/******************************
 *
 * INITIALIZE BUNDLING
 *
 */

const isProduction = process.env.NODE_ENV === 'production' || process.argv.includes('-p');
const isHMR = process.argv.includes('--hot');
const isWatch = process.argv.includes('--watch');
const devtool = isProduction ? (buildConfig.sourcemapsInProduction ? 'cheap-source-map' : false) : 'inline-source-map';
let extensions = [ '*', '.js', '.json' ];
let plugins = [];
let rules = [];
let sassExcludes = [];

const pkgArg = argv.env && argv.env.package;
const themeArg = argv.env && argv.env.theme;
let themesPath = path.resolve(__dirname, buildConfig.rootPath, 'application/themes');
let themes = [];
let entryPoints = {};


/******************************
 *
 * DEVELOPMENT PLUGINS
 *
 */

const definePlugin = new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
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
    disable: isHMR,
});

const extractSASS = new ExtractTextPlugin({
    filename: '[name].css',
    allChunks: true,
    disable: isHMR,
});

const providePlugin = new webpack.ProvidePlugin(buildConfig.providePlugins);

plugins.push(definePlugin, errorsPlugin, extractCSS, extractSASS, providePlugin);

if (isHMR) {
    const hmrPlugin = new webpack.HotModuleReplacementPlugin();
    const namedModulesPlugin = new webpack.NamedModulesPlugin();

    plugins.push(hmrPlugin, namedModulesPlugin);
}

if (isWatch) {
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

/******************************
 *
 * PRODUCTION PLUGINS
 *
 */

if (isProduction) {
    const uglifyPlugin = new UglifyJsPlugin({
        test: /\.js($|\?)/i,
        parallel: 4,
        sourceMap: true,
    });

    const scopeHoistingPlugin = new webpack.optimize.ModuleConcatenationPlugin();

    const optimizeCssPlugin = new OptimizeCssAssetsPlugin({
        // assetNameRegExp: /\.css$/i,
        cssProcessor: require('cssnano'),
        cssProcessorOptions: {
            discardComments: {
                removeAll: true,
            },
            map: {
                inline: !isProduction,
            },
        },
        canPrint: true,
    });

    plugins.push(uglifyPlugin, scopeHoistingPlugin, optimizeCssPlugin);
}

/******************************
 *
 * LOADERS
 *
 */

const styleLoader = {
    loader: 'style-loader',
    options: {
        hmr: isHMR,
        sourceMap: !!devtool,
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
        sourceMap: !!devtool,
    },
};

const cssLoader = {
    loader: 'css-loader',
    options: {
        minimize: isProduction,
        url: false,
        importLoaders: 1,
        sourceMap: !!devtool,
    },
};

const sassLoader = extraIncludePaths => ({
    loader: 'sass-loader',
    options: {
        includePaths: buildConfig.sassIncludePaths.concat(extraIncludePaths || []),
        sourceMap: !!devtool,
        outputStyle: isProduction ? 'compressed' : 'nested',
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
                        uglify: isProduction,
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

/******************************
 *
 * RULES
 *
 */

rules.push({
    test: /\.css$/i,
    use: extractCSS.extract({
        fallback: styleLoader,
        use: [ cssLoader, postCSSLoader ],
    }),
});

rules.push({
    test: /\.s[ac]ss$/i,
    use: extractSASS.extract({
        fallback: styleLoader,
        use: [ cssLoader, postCSSLoader, sassLoader() ],
    }),
    exclude: sassExcludes,
});

rules.push({
    test: /\.js$/i,
    use: jsLoader,
    exclude: /(node_modules|bower_components)/i,
});

/******************************
 *
 * VUE COMPATIBILITY
 *
 */

if (buildConfig.enableVue) {
    const extractVUE = new ExtractTextPlugin({
        filename: '[name].css',
        allChunks: true,
        disable: isHMR,
    });

    plugins.push(extractVUE);

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

    rules.push({
        test: /\.vue$/i,
        loader: vueLoader,
        exclude: /bower_components/i,
    });

    extensions.push('.vue');
}

/******************************
 *
 * TYPESCRIPT COMPATIBILITY
 *
 */

if (buildConfig.enableTypescript) {
    const tsLoader = {
        loader: 'ts-loader',
        exclude: /node_modules/i,
        options: {
            appendTsSuffixTo: [/\.vue$/i],
        }
    };

    rules.push({
        test: /\.tsx?$/i,
        loader: tsLoader,
    });

    extensions.push('.ts', '.tsx');
}

/******************************
 *
 * BUILD ENTRY POINTS
 *
 * (sorry...needs a refactor)
 *
 */

// PACKAGES

let packageAssetsPath = buildConfig.rootPath + 'packages/*/src/Resources/assets/index.js';
if (isProduction && !buildConfig.alwaysBuildFromPackages) {
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
    entryPoints[theme.name] = [ theme.path + '/assets/js/index.js', theme.path + '/assets/stylesheets/main.scss' ]
        .concat(packageAssets.map(pA => pA.path));

    // TODO: create rule generator function with smart merging of options
    rules.push({
        test: new RegExp(theme.path + '.*\.s[ac]ss$'),
        use: extractSASS.extract({
            fallback: styleLoader,
            use: [ cssLoader, postCSSLoader, sassLoader(theme.path + '/assets/stylesheets/_defaults') ],
        }),
    });

    sassExcludes.push(theme.path + '/assets/stylesheets/main.scss');
}

/******************************
 *
 * WEBPACK CONFIG OBJECT
 *
 */

const webpackConfig = {
    context: path.resolve(__dirname, buildConfig.rootPath),
    entry: entryPoints,
    output: {
        path: path.resolve(__dirname, buildConfig.rootPath, 'application/assets'),
        filename: '[name].js',
        chunkFilename: '[name].js',
        publicPath: '',
    },
    devtool,
    module: {
        rules,
    },
    plugins,
    stats: {
        hash: false,
        version: false,
        timings: false,
        children: false,
        errorDetails: false,
        chunks: false,
        modules: false,
        reasons: false,
        source: false,
        publicPath: false,
    },
    devServer: {
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        contentBase: path.resolve(__dirname, buildConfig.rootPath),
        historyApiFallback: true,
        noInfo: true,
        compress: true,
        quiet: true,
    },
    resolve: {
        extensions,
        alias: {
            'Packages': path.resolve(__dirname, buildConfig.rootPath, 'packages/'),
            // 'SpecificImport$': path.resolve(__dirname, buildConfig.rootPath, 'packages/specific-file.js'),
        },
    },
    resolveLoader: {
        modules: [ path.resolve(__dirname, 'node_modules'), 'node_modules' ],
    },
};

module.exports = webpackConfig;
