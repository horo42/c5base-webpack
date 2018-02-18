const baseConfig = require('./base.config');
const entryConfig = require('./entry.config');
const loaderConfig = require('./loader.config');
const ruleConfig = require('./rule.config');
const devPlugin = require('./plugins.dev.config');
const prodPlugin = require('./plugins.prod.config');
const vueConfig = require('./vue.config');
const tsConfig = require('./ts.config');

class Builder {
  constructor() {
    this.config = {};
    this.loaders = {};
    this.extractors = {};
    this.sassExcludes = [];
  }

  build(buildConfig) {
    this.buildConfig = buildConfig;
    this.config = baseConfig(buildConfig);

    this
      .buildLoader()
      .buildPlugin()
      .buildRule()
      .buildEntry();

    if (buildConfig.enableVue) {
      this.vueSupport();
    }

    if (buildConfig.enableTypescript) {
      this.tsSupport();
    }

    return this.config;
  }

  buildLoader() {
    this.loaders = loaderConfig(this.buildConfig);

    return this;
  }

  buildPlugin() {
    const { plugins, extractors } = devPlugin(this.buildConfig);

    this.config.plugins.push(...plugins, ...extractors);
    this.extractors = extractors;

    if (this.buildConfig.isProduction()) {
      this.config.plugins.push(...prodPlugin(this.buildConfig));
    }

    return this;
  }

  buildEntry() {
    const { entries, rules} = entryConfig(this.buildConfig, this.loaders, this.sassExcludes, this.extractors);

    this.config.entry = entries;
    this.config.module.rules.push(...rules);

    return this;
  }

  buildRule() {
    this.config.module.rules = ruleConfig(this.loaders, this.sassExcludes, this.extractors);

    return this;
  }

  vueSupport() {
    const { plugin, rule, extensions } = vueConfig(this.buildConfig);

    this.config.module.rules.push(rule);
    this.config.plugins.push(plugin);
    this.config.resolve.extensions.push(...extensions);

    return this;
  }

  tsSupport() {
    const { rule, extensions } = tsConfig();

    this.config.module.rules.push(rule);
    this.config.resolve.extensions.push(...extensions);

    return this;
  }

}

module.exports = new Builder();
