const path = require('path');
const exists = require('fs').existsSync;
const getGitUser = require('./git-user');
const metadata = require('read-metadata');

module.exports = function option(name, dir) {
  const opts = getMetadata(dir);

  setDefault(opts, 'name', name);

  const author = getGitUser();
  if (author) {
    setDefault(opts, 'author', author);
  }

  return opts;
};

function getMetadata(dir) {
  const json = path.join(dir, 'meta.json');
  let opts = {};

  if (exists(json)) {
    opts = metadata.sync(json);
  }

  return opts;
}

function setDefault(opts, key, val) {
  if (opts.schema) {
    opts.prompts = opts.schema;
    delete opts.schema;
  }

  const prompts = opts.prompts || (opts.prompts = {});

  if (!prompts[key] || typeof prompts[key] !== 'object') {
    prompts[key] = {
      type: 'string',
      default: val,
    };
  } else {
    prompts[key].default = val;
  }
}
