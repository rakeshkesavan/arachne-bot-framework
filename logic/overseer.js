'use strict';

const hub = require('./hub');

module.exports.handleCommand = hub.handleCommand;
module.exports.ThreadManager = hub.ThreadManager;
module.exports.StorageManager = {
  getItem: (skill, key) => hub.StorageManager.getItem(skill, key),
  storeItem: (skill, key, value) => hub.StorageManager.storeItem(skill, key, value)
};
module.exports.HookManager = {
  create: (skill, messageOnDelete) => hub.HookManager.create(skill, messageOnDelete),
  remove: (hookId) => hub.HookManager.remove(hookId),
  execute: (hookId, message, options) => hub.HookManager.execute(hookId, message, options),
  codes: hub.HookManager.codes
}
module.exports.PipeManager = {
  create: (skill, handler, secret = null) => hub.PipeManager.create(skill, handler, secret)
}
module.exports.log = (skillName, log) => hub.LogManager.log(skillName, log);
