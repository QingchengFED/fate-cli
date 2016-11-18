var Metalsmith = require('metalsmith')
var path = require('path')
var getOptions = require('./options')
var render = require('consolidate').handlebars.render
var ask = require('./ask')
var async = require('async')


/**
 * Generate a template given a src and dest
 * @param {String} name
 * @param {String} src
 * @param {String} dest
 * @param {Function} done
 */

module.exports = function generate(name, src, dest, done) {
    var opts = getOptions(name, src)
    var metalsmith = Metalsmith(path.join(src, 'template'))
    var data = Object.assign(metalsmith.metadata(), {
        destDirName: name,
        inPlace: dest === process.cwd(),
        noEscape: true
    })

    metalsmith
        .use(askQuestions(opts.prompts))
        .use(renderTemplateFiles(opts.skipInterpolation))
        .clean(false)
        .source('.')
        .destination(dest)
        .build(function (err) {
            console.log('build done');
            done(err)
            console.log('done') //TODO: ADD logMessage
        })

    return data;
}


/**
 * Create a middleware for asking questions.
 *
 * @param {Object} prompts
 * @return {Function}
 */

function askQuestions (prompts) {
    return function (files, metalsmith, done) {
        ask(prompts, metalsmith.metadata(), done)
    }
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
        var keys = Object.keys(files)
        var metalsmithMetadata = metalsmith.metadata()

        async.each(keys, function (file, next) {
            var str = files[file].contents.toString();

            if (!/{{([^{}]+)}}/g.test(str)) {
                return next()
            }
            
            render(str, metalsmithMetadata, function (err, res){
                if (err) return next(err)
                files[file].contents = new Buffer(res)
                next()
            })
        }, done)
    }
}