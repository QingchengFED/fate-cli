/**
 * author wxttt
 */
const chalk = require('chalk');
const Metalsmith = require('metalsmith');
const render = require('consolidate').handlebars.render;

const ngQuick = require('./ng-quick');

const templateMap = {
  page: { desc: '创建一个page的目录结构，包含index.js(controller)/index_svc.js/index.html以及内部的components目录' },
  component: { desc: '创建一个component的目录结构, 包含index.js(directive),index.html' },
  ctrl: { desc: '创建一个controller文件' },
  service: { desc: '创建一个service文件' },
  dirc: { desc: '创建一个directive文件' },
};

function logTemplate(shortName, desc) {
  // eslint-disable-next-line no-console
  console.log(`  ${chalk.yellow('★')
    }  ${chalk.blue(shortName)
    } - ${desc}`);
}

module.exports = {
  quick(template, name) {
    const buildTemplateMap = {
      page: ngQuick.buildPage,
      component: ngQuick.buildComponent,
      ctrl: ngQuick.buildCtrl,
      service: ngQuick.buildService,
      dirc: ngQuick.buildDirc,
    };

    if (buildTemplateMap[template]) {
      buildTemplateMap[template](name);
    } else {
      console.log('template generation solution not finished');
    }
  },
  help() {
    for (const key in templateMap) {
      logTemplate(key, templateMap[key].desc);
    }
  },
};
