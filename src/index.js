'use strict';
const TcbServerRouter = require('./router');
const cloud = require('tcb-admin-node');
const is = require('is-type-of');
const fs = require('fs');
const path = require('path');

class TcbServer {
  constructor ({ env, credentials, version }) {
    this.app = null;
    this.modules = {};
    this.loadModules();
    this.cloud = cloud;
    // init tcb sdk
    this.cloud.init({
      env,
      credentials,
      version
    });
  }

  loadModules () {
    // load all directories js modules
    const directories = ['controller', 'middleware', 'service'];

    for (const directory of directories) {
      if (!fs.existsSync(directory))
        continue;
      const exports = this.registerModules(directory);
      this.modules[directory] = exports;
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
          // compatible class
          exports[path.basename(file, '.js')] = new obj();
        }
        if (is.function(obj) && !is.class(obj)) {
          exports[path.basename(file, '.js')] = obj;
        }
      }
    }
    return exports;
  }

  serve ({ event, router }) {
    event.$url = event.$url || event.path;
    this.app = new TcbServerRouter({ event });
    // attach all modules
    Object.assign(this.app, { ...this.modules })
    // attach tcb sdk instance
    this.app.cloud = this.cloud;

    router(this.app);
    this.app.serve();
  }
}

module.exports = TcbServer;
