/**
 * author wxttt
 */
const chalk = require('chalk');

const ngQuick = require('./ng-quick');

const templateMap = {
  page: { desc: '创建一个page的目录结构，包含index.js(controller)/index_svc.js/index.html以及内部的components目录' },
  component: { desc: '创建一个component的目录结构, 包含index.js(directive),index.html' },
  ctrl: { desc: '创建一个controller文件' },
  svc: { desc: '创建一个service文件' },
  dirc: { desc: '创建一个directive文件' },
};

function logTemplate(shortName, desc) {
  // eslint-disable-next-line no-console
  console.log(`  ${chalk.yellow('★')
  }  ${chalk.redBright(shortName)
  } - ${desc}`);
}

module.exports = {
  quick(template, name) {
    const buildTemplateMap = {
      page: ngQuick.buildPage,
      component: ngQuick.buildComponent,
      ctrl: ngQuick.buildCtrl,
      svc: ngQuick.buildService,
      dirc: ngQuick.buildDirc,
    };

    if (buildTemplateMap[template]) {
      buildTemplateMap[template](name);
    } else {
      console.log(chalk.red('selected template doesnt exist'));
    }
  },
  help() {
    Object.keys(templateMap).forEach((key) => {
      logTemplate(key, templateMap[key].desc);
    });
  },
};
