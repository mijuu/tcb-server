'use strict';
const TcbServerRouter = require('./router');
const cloud = require('tcb-admin-node');
const is = require('is-type-of');
const fs = require('fs');
const path = require('path');

class TcbServer {
  constructor (config) {
    this.app = {
      cloud,
      ctx: {}
    };
    this.loadModules();
    // init tcb sdk
    this.app.cloud.init(config);
  }

  loadModules () {
    // load all directories js modules
    const directories = ['controller', 'middleware', 'service'];

    for (const directory of directories) {
      if (!fs.existsSync(directory))
        continue;
      const exports = this.registerModules(directory);
      this.app[directory] = exports;
    }
  }

  registerModules (directory) {
    const exports = {};
    const files = fs.readdirSync(directory);
    for (const file of files) {
      const filePath = path.join(directory, file);
      if (fs.statSync(filePath).isDirectory()) {
        exports[file] = this.registerModules(filePath);
      } else {
        const fullPath = path.join(process.cwd(), filePath);
        const obj = require(fullPath);
        if (is.class(obj)) {
          // new a class instance and bind all methods
          exports[path.basename(file, '.js')] = bindClassInstance(obj, this.app);
        }
        if (is.function(obj) && !is.class(obj)) {
          exports[path.basename(file, '.js')] = obj.bind(this.app);
        }
      }
    }
    return exports;
  }

  serve ({ event, router }) {
    event.$url = event.$url || event.path;
    this.app.ctx = new TcbServerRouter({ event });
    this.app.router = this.app.ctx.router.bind(this.app.ctx);
    this.app.use = this.app.ctx.use;

    router(this.app);
    return this.app.ctx.serve();
  }
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
      instance[key] = instance[key].bind(app)
  }
  return instance
}

module.exports = TcbServer;
