/**
 * Created by wxttt on 2018/6/7.
 */
const Metalsmith = require('metalsmith');
const path = require('path');
const chalk = require('chalk');
const cons = require('consolidate');
const inquirer = require('inquirer');
const render = require('consolidate').handlebars.render; // eslint-disable-line
const fs = require('fs');
const async = require('async');
const config = require('./config/config');
const _ = require('lodash');

const pageTplRoot = path.join(__dirname, './ng_templates/page');
const componentTplRoot = path.join(__dirname, './ng_templates/component');
const ctrlTplRoot = path.join(__dirname, './ng_templates/ctrl_tpl.js');
const serviceTplRoot = path.join(__dirname, './ng_templates/service_tpl.js');
const dircTplRoot = path.join(__dirname, './ng_templates/dirc_tpl.js');

/**
 * @description metalsmith插件，基于handlebar渲染文件内容
 * @param {*} files
 * @param {*} metalsmith
 * @param {*} done
 */
function templatePlugin(files, metalsmith, done) {
  const keys = Object.keys(files);
  const metadata = metalsmith.metadata();

  function run(file, runDone) {
    const str = files[file].contents.toString();
    render(str, metadata, (err, res) => {
      if (err) return done(err);
      files[file].contents = Buffer.from(res); // eslint-disable-line
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
    });

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
 * @param tplFolder
 * @param metaObj
 * @param dest
 * @param successTxt
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
  // eslint-disable-next-line
  const pageName = _.camelCase(getTailPathName(name)); 
  const metaObj = { pageName };
  const dest = path.resolve(name);
  const successTxt = chalk.green(`Build Page ${pageName} success!`);

  buildFolder(pageTplRoot, metaObj, dest, successTxt);
}

/**
 * @description 创建一个组件的基本文件
 * @param name
 */
function buildComponent(name) {
  // eslint-disable-next-line
  const componentName = _.camelCase(getTailPathName(name));
  const metaObj = { componentName };
  const dest = path.resolve(name);
  const successTxt = chalk.green(`Build Component ${componentName} success!`);

  buildFolder(componentTplRoot, metaObj, dest, successTxt);
}

/**
 * @description 初始化一个controller文件
 * @param name
 */
function buildCtrl(name) {
  const context = _.extend(config.getConfig(), {
    ctrlName: `${_.camelCase(name)}Ctrl`,
  });

  const successTxt = `build ${_.camelCase(name)}Ctrl success~`;
  buildFile(ctrlTplRoot, context, 'index.js', successTxt);
}

/**
 * @description 初始化一个service文件
 * @param name
 */
function buildService(name) {
  const context = _.extend(config.getConfig(), {
    serviceName: `${_.camelCase(name)}Svc`,
  });

  const successTxt = `build ${_.camelCase(name)}Svc success~`;
  buildFile(serviceTplRoot, context, 'index_svc.js', successTxt);
}

/**
 * @description 初始化一个directive文件
 * @param name
 */
function buildDirc(name) {
  const context = _.extend(config.getConfig(), {
    directiveName: `${_.camelCase(name)}`,
  });

  const successTxt = `build ${_.camelCase(name)} success~`;
  buildFile(dircTplRoot, context, 'index.js', successTxt);
}

/**
 * @description 根据输入的目录结构返回最后一级的目录名称
 * @param path 目录地址
 */
function getTailPathName(pathName) {
  const reg = /\/?([\w-]+)\/?$/;
  const result = pathName.match(reg);

  if (result !== null) {
    return result[1]; // 返回捕获项
  }

  return '';
}

module.exports = {
  buildPage,
  buildComponent,
  buildCtrl,
  buildService,
  buildDirc,
};

