/**
 * Created by wxttt on 2018/6/7.
 */
const Metalsmith = require('metalsmith');
const path = require('path');
const chalk = require('chalk');
const cons = require('consolidate');
const inquirer = require('inquirer');
/*eslint-disable */
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

function templatePlugin(files, metalsmith, done) {
  const keys = Object.keys(files);
  const metadata = metalsmith.metadata();

  function run(file, runDone) {
    const str = files[file].contents.toString();
    render(str, metadata, (err, res) => {
      if (err) return done(err);
      files[file].contents = Buffer.from(res);
      return runDone();
    });
  }

  async.each(keys, run, done);
}

/**
 * @description 生成创建page过程中的meta
 * @param metaObj {Object}
 * @returns {function(*, *, *)}
 */
function setMeta(metaObj = {}) {
  return (files, metalsmith, done) => {
    const metadata = metalsmith.metadata();
    const currentConfig = config.getConfig();

    _.each(currentConfig, (value, key) => {
      metadata[key] = value;
    });

    _.each(metaObj, (value, key) => {
      metadata[key] = value;
    })

    done();
  };
}

/**
 * @description 基于模板&上下文向指定文件中渲染内容
 * @param tplFile
 * @param context
 * @param dest
 * @param successTxt
 */
function buildFile(tplFile, context, dest, successTxt) {
  const existed = fs.existsSync(dest);
  function run() {
    cons
      .handlebars(tplFile, context)
      .then((result) => {
        fs.writeFile(dest, result, (err) => {
          if (err) {
            console.log(chalk.red('build File Error！'));
            console.log(err);
          }

          console.log(chalk.green(successTxt || 'build File success'));
        });
      });
  }

  if (existed) {
    inquirer.prompt([{
      type: 'confirm',
      message: '文件已存在是否覆盖',
      name: 'ok',
    }]).then((answers) => {
      if (answers.ok) {
        run();
      } else {
        console.log(chalk.yellow('操作已取消'));
      }
    });
  } else {
    run();
  }
}

/**
 * @description 基于模板渲染某个目录的文件
 * @param {*} tplFolder 
 * @param {*} metaObj 
 * @param {*} dest 
 * @param {*} successTxt 
 */
function buildFolder(tplFolder, metaObj, dest, successTxt) {
  const existed = fs.existsSync(dest);

  function run() {
    const metalsmith = Metalsmith(tplFolder);

    metalsmith
      .use(setMeta(metaObj))
      .use(templatePlugin)
      .destination(dest)
      .build((err) => {
        if (err) throw err;
        console.log(successTxt);
      });
  }

  if (existed) {
    inquirer.prompt([{
      type: 'confirm',
      message: '目录已存在是否覆盖',
      name: 'ok',
    }]).then((answers) => {
      if (answers.ok) {
        run();
      } else {
        console.log(chalk.yellow('操作已取消'));
      }
    });
  } else {
    run();
  }
}

/**
 * @description 创建一个页面的基本文件
 * @param name
 */
function buildPage(name) {
  const metaObj = { pageName: _.camelCase(name) };
  const dest = path.resolve(name);
  const successTxt = chalk.green(`Build Page ${_.camelCase(name)} success!`);

  buildFolder(pageTplRoot, metaObj, dest, successTxt);
}

/**
 * @description 创建一个组件的基本文件
 * @param name
 */
function buildComponent(name) {
  const metaObj = { componentName: _.camelCase(name) };
  const dest = path.resolve(name);
  const successTxt = chalk.green(`Build Component ${_.camelCase(name)} success!`);

  buildFolder(componentTplRoot, metaObj, dest, successTxt);
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

  const successTxt = `build ${name} success~`;
  buildFile(dircTplRoot, context, 'index.js', successTxt);
}

module.exports = {
  buildPage,
  buildComponent,
  buildCtrl,
  buildService,
  buildDirc,
};

