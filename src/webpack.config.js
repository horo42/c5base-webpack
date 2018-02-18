const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

/******************************
 *
 * LOAD CONFIGURATION
 *
 */

const configFilename = 'c5base.config.js';

let configPath = '../../../' + configFilename;
if (!fs.existsSync(path.resolve(__dirname, configPath))) {
    console.error(chalk.bold.yellow(`No ${configFilename} file found in project root, using default config...`));
    configPath = './default.config.js';
}

require(configPath);
const buildConfig = require('./config.js');

/******************************
 *
 * BUILD WEBPACK CONFIG
 *
 */

const Builder = require('./builders/builder');
module.exports = Builder.build(buildConfig);
