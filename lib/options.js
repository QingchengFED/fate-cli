var path = require('path')
var exists = require('fs').existsSync
var getGitUser = require('./git-user')
var metadata = require('read-metadata')


module.exports = function option (name, dir) {
    var opts = getMetadata(dir)

    setDefault(opts, 'name', name)

    var author = getGitUser();
    if (author) {
        setDefault(opts, 'author', author)
    }

    return opts;
}

function getMetadata (dir) {
    var json = path.join(dir, 'meta.json')
    var opts = {}

    if(exists(json)){
        opts = metadata.sync(json)
    }

    return opts;
}

function setDefault (opts, key, val) {
    if (opts.schema) {
        opts.prompts = opts.schema
        delete opts.schema
    }

    var prompts = opts.prompts || (opts.prompts = {})

    if (!prompts[key] || typeof prompts[key] !== 'object') {
        prompts[key] = {
            'type': 'string',
            'default': val
        }
    } else {
        prompts[key]['default'] = val
    }
}