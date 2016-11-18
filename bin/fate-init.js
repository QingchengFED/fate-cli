#!/usr/bin/env node

var program = require('commander')
var chalk = require('chalk')
var path = require('path')
var exists = require('fs').existsSync
var inquirer = require('inquirer')
var download = require('download-git-repo')
var os = require('os')
var rm = require('rimraf').sync
var uid = require('uid')
var ora = require('ora')
var generate = require('../lib/generate')


var templateMapping = {
    'ea': 'QingchengFED/fate-template-EnumsElish'
}


/**
 * Usage
 */
program.usage('<template-name> [project-name]')


/**
 *  Help
 */

program.on('--help', function () {
    console.log('  Examples:')
    console.log()
    console.log(chalk.green.bgRed(' # create a project with my template'))
    console.log(' $ fate init <template-name> [project-name]')
    console.log()
})


function help() {
    program.parse(process.argv)
    if (program.args.length < 1) return program.help();
}

help();

/**
 * Settings
 */

var template = program.args[0]
var rawName = program.args[1]
var inPlace = !rawName || rawName === '.'
var name = inPlace ? path.relative('../', process.cwd()) : rawName
var to = path.resolve(rawName || '.')

if (exists(to)) {
    inquirer.prompt([{
        type: 'confirm',
        message: inPlace
            ? 'Generate project in current directory?'
            : 'Target directory exists. Continue?',
        name: 'ok'
    }], function (answers) {
        if (answers.ok) {
            run()
        }
    })
} else {
    run()
}

/**
 * Check, download and generate the project
 */

function run() {
    var tmp = os.tmpdir() + 'fate-template-' + uid()

    if (!templateMapping[template])
        return console.log(chalk.red('can not find template repo'))

    var spinner = ora('downloading template')
    spinner.start()

    download(templateMapping[template], tmp, {clone: false}, function (err) {
        spinner.stop()

        process.on('exit', function () {
            rm(tmp)
        })

        if (err) console.log(chalk.red('Failed to download repo'))

        generate(name, tmp, to, function (err) {
            console.log('get err', err);
            if (err)  console.log(chalk.red(err))
            console.log()
            console.log(chalk.green('Generate success'))
        })
    })
}
