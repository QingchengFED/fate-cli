const Metalsmith = require('metalsmith');
const path = require('path');
const getOptions = require('./options');
const render = require('consolidate').handlebars.render;
const ask = require('./ask');
const async = require('async');


/**
 * Generate a template given a src and dest
 * @param {String} name
 * @param {String} src
 * @param {String} dest
 * @param {Function} done
 */

module.exports = function generate(name, src, dest, done) {
  const opts = getOptions(name, src);
  const metalsmith = Metalsmith(path.join(src, 'template'));
  const data = Object.assign(metalsmith.metadata(), {
    destDirName: name,
    inPlace: dest === process.cwd(),
    noEscape: true,
  });

  metalsmith
    .use(askQuestions(opts.prompts))
    .use(renderTemplateFiles(opts.skipInterpolation))
    .clean(false)
    .source('.')
    .destination(dest)
    .build((err) => {
      console.log('build done');
      done(err);
      console.log('done'); // TODO: ADD logMessage
    });

  return data;
};


/**
 * Create a middleware for asking questions.
 *
 * @param {Object} prompts
 * @return {Function}
 */

function askQuestions(prompts) {
  return function (files, metalsmith, done) {
    ask(prompts, metalsmith.metadata(), done);
  };
}


/**
 * Template in place plugin.
 *
 * @params {Object} files
 * @params {Metalsmith} metalsmith
 * @params {Function} done
 * @returns {Function}
 */

function renderTemplateFiles() {
  return function (files, metalsmith, done) {
    const keys = Object.keys(files);
    const metalsmithMetadata = metalsmith.metadata();

    async.each(keys, (file, next) => {
      const str = files[file].contents.toString();

      if (!/{{([^{}]+)}}/g.test(str)) {
        return next();
      }

      render(str, metalsmithMetadata, (err, res) => {
        if (err) return next(err);
        files[file].contents = new Buffer(res);
        next();
      });
    }, done);
  };
}
