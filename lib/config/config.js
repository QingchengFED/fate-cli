/**
 * @fileoverview 负责获取配置
 * @author wxttt
 */

const defaultConfig = require('./default-config');
const os = require('os');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const CONFIG_FILE_NAME = '.faterc.js';
const PERSONAL_CONFIG_DIR = os.homedir();

/**
 * @description 基于当前目录的faterc.js文件获取本地的配置
 * @returns {{}}
 */
function getLocalConfig() {
  const filePath = path.join(process.cwd(), CONFIG_FILE_NAME);
  const isFileExisted = fs.existsSync(filePath);

  if (!isFileExisted) {
    return {};
  }

  const localConfig = require(filePath);

  return localConfig;
}

/**
 * @description 基于根目录的faterc.js文件获取global的配置
 * @returns {*}
 */
function getPersonalConfig() {
  const filePath = path.join(PERSONAL_CONFIG_DIR, CONFIG_FILE_NAME);
  const isFileExisted = fs.existsSync(filePath);

  if (!isFileExisted) {
    return {};
  }

  const personalConfig = require(filePath);

  return personalConfig;
}

/**
 * @description 获取配置
 * @return {*}
 */
function getConfig() {
  const config = defaultConfig;
  const localConfig = getLocalConfig();
  const personalConfig = getPersonalConfig();

  return _.merge(config, personalConfig, localConfig);
}

module.exports = {
  getConfig,
  getLocalConfig,
  getPersonalConfig,
};
