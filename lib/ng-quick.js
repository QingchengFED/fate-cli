/**
 * Created by wxttt on 2018/6/7.
 */
const Metalsmith = require('metalsmith');
const path = require('path');
const chalk = require('chalk');
const cons = require('consolidate');
const render = require('consolidate').handlebars.render;
const fs = require('fs');
const async = require('async');
const config = require('./config/config');
const _ = require('lodash');

const pageTplRoot = path.join(__dirname, './ng_templates/page');
const componentTplRoot = path.join(__dirname, './ng_templates/component');
const ctrlTplRoot = path.join(__dirname, './ng_templates/ctrl_tpl.js');
const serviceTplRoot = path.join(__dirname, './ng_templates/service_tpl.js');
const dircTplRoot = path.join(__dirname, './ng_templates/dirc_tpl.js');

function template(files, metalsmith, done) {
  const keys = Object.keys(files);
  const metadata = metalsmith.metadata();

  async.each(keys, run, done);

  function run(file, runDone) {
    const str = files[file].contents.toString();
    render(str, metadata, (err, res) => {
      if (err) return done(err);
      files[file].contents = new Buffer(res);
      return runDone();
    });
  }
}

/**
 * @description 生成创建page过程中的meta
 * @param nameKey
 * @param name
 * @returns {function(*, *, *)}
 */
function setMeta(nameKey, name) {
  return (files, metalsmith, done) => {
    const metadata = metalsmith.metadata();
    const currentConfig = config.getConfig();

    metadata[nameKey] = _.camelCase(name);
    _.each(currentConfig, (value, key) => {
      metadata[key] = value;
    });

    done();
  };
}

/**
 * @description 基于模板&上下文向指定文件中渲染内容
 * @param tplFile
 * @param context
 * @param dest
 */
function buildFile(tplFile, context, dest, successTxt) {
  cons
    .handlebars(tplFile, context)
    .then((result) => {
      fs.writeFile(dest, result, (err) => {
        if (err) {
          console.log(chalk.red('build File Error！'));
          console.log(err);
        }

        console.log(chalk.green(successTxt||'build File success'))
      });
    });
}

/**
 * @description 创建一个页面的基本文件
 * @param name
 */
function buildPage(name) {
  const metalsmith = Metalsmith(pageTplRoot);

  metalsmith
    .use(setMeta('pageName', name))
    .use(template)
    .destination(path.resolve(name))
    .build((err) => {
      if (err) throw err;
      console.log('Build Page finished!');
    });
}

/**
 * @description 创建一个组件的基本文件
 * @param name
 */
function buildComponent(name) {
  const metalsmith = Metalsmith(componentTplRoot);

  metalsmith
    .use(setMeta('componentName', name))
    .use(template)
    .destination(path.resolve(name))
    .build((err) => {
      if (err) throw err;
      console.log('Build Component finished!');
    });
}

/**
 * @description 初始化一个controller文件
 * @param name
 */
function buildCtrl(name) {
  const context = _.extend(config.getConfig(), {
    ctrlName: `${name}Ctrl`,
  });

  const successTxt = `build ${name}Ctrl success~`;
  buildFile(ctrlTplRoot, context, 'index.js', successTxt);
}

/**
 * @description 初始化一个service文件
 * @param name
 */
function buildService(name) {
  const context = _.extend(config.getConfig(), {
    serviceName: `${name}Svc`,
  });

  const successTxt = `build ${name}Svc success~`;
  buildFile(serviceTplRoot, context, 'index_svc.js', successTxt);
}

/**
 * @description 初始化一个directive文件
 * @param name
 */
function buildDirc(name) {
  const context = _.extend(config.getConfig(), {
    directiveName: `${name}`,
  });

  const successTxt = `build ${name} success~`
  buildFile(dircTplRoot, context, 'index.js', successTxt);
}

module.exports = {
  buildPage,
  buildComponent,
  buildCtrl,
  buildService,
  buildDirc,
};

