const async = require('async');
const inquirer = require('inquirer');

const promptMapping = {
  string: 'input',
  boolean: 'confirm',
};

module.exports = function ask(prompts, data, done) {
  async.eachSeries(Object.keys(prompts), (key, next) => {
    prompt(data, key, prompts[key], next);
  }, done);
};


/**
 * Inquirer prompt wrapper
 *
 * @param {Object} data
 * @param {String} key
 * @param {Object} prompt
 * @param {Function} done
 */

function prompt(data, key, prompt, done) {
  // TODO: validate 相关
  inquirer.prompt([{
    type: promptMapping[prompt.type] || prompt.type,
    name: key,
    message: prompt.message || prompt.label || key,
    default: prompt.default,
  }]).then((answers) => {
    console.log('answers is', answers);
    if (Array.isArray(answers[key])) {
      data[key] = {};
      answers[key].forEach((multiChoiceAnswer) => {
        data[key][multiChoiceAnswer] = true;
      });
    } else {
      data[key] = answers[key];
    }

    done();
  });
}
