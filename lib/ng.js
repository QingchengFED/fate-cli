/**
 * author wxttt
 */
const chalk = require('chalk');

const templateMap = {
  page: { desc: '创建一个page的目录结构，包含index.js(controller)/index_svc.js/index.html以及内部的components目录' },
  component: { desc: '创建一个component的目录结构, 包含index.js(directive),index.html' },
  ctrl: { desc: '创建一个controller文件' },
  service: { desc: '创建一个service文件' },
  dirc: { desc: '创建一个directive文件' },
};

function logTemplate(shortName, desc) {
  console.log(`  ${chalk.yellow('★')
  }  ${chalk.blue(shortName)
  } - ${desc}`);
}


module.exports = {
  quick(template, name) {
    console.log(templateMap[template].desc);
    console.log('name is', name);
  },
  help() {
    for (const key in templateMap) {
      logTemplate(key, templateMap[key].desc);
    }
  },
};
