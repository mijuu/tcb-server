'use strict';
const TcbServerRouter = require('./router');
const BaseContextClass = require('./base-context-class');
const tcb = require('@cloudbase/node-sdk');
const is = require('is-type-of');
const fs = require('fs');
const path = require('path');

class Application {
  constructor (config) {
    this.app = {
      cloud: null,
      ctx: {}
    };
    this.error = null;
    // init tcb sdk
    try {
      this.app.cloud = tcb.init(config);
      this.loadModules();

      this.server = new TcbServerRouter();
      this.app.router = this.server.router.bind(this.server);
      this.app.use = this.server.use;
    } catch (err) {
      this.error = err;
    }
  }

  loadModules () {
    // load all directories js modules
    const directories = ['controller', 'middleware', 'service'];

    directories.forEach(directory => { this.app[directory] = {}});
    for (const directory of directories) {
      if (!fs.existsSync(directory))
        continue;
      const exports = registerModules(directory, this.app);
      Object.assign(this.app[directory], exports);
    }
  }

  serve ({ event, context, router }) {
    if (this.error) {
      console.error(this.error);
      return { code: 500, name: this.error.name };
    }
    router(this.app);
    return this.server.serve({
      event,
      context,
      ctx: this.app.ctx
    });
  }
}

function registerModules (directory, app) {
  const exports = {};
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const filePath = path.join(directory, file);
    if (fs.statSync(filePath).isDirectory()) {
      exports[file] = registerModules(filePath, app);
    } else {
      const fullPath = path.join(process.cwd(), filePath);
      const obj = require(fullPath);
      if (is.class(obj)) {
        // new a class instance and bind all methods
        exports[path.basename(file, '.js')] = bindClassInstance(obj, app);
      }
      if (is.function(obj) && !is.class(obj)) {
        exports[path.basename(file, '.js')] = obj.bind(app);
      }
    }
  }
  return exports;
}

function bindClassInstance (Class, app) {
  const instance = new Class(app);
  const protos = Class.prototype;
  const keys = Object.getOwnPropertyNames(protos);
  for (const key of keys) {
    if (key === 'constructor')
      continue
    
    const desc = Object.getOwnPropertyDescriptor(protos, key);
    if (is.function(desc.value))
      instance[key] = instance[key].bind(instance)
  }
  return instance
}

module.exports = {
  Application,
  BaseContextClass
};
