'use strict';

class BaseContextClass {
  constructor (app) {
    this.app = app;
    this.ctx = app.ctx;
    this.controller = app.controller;
    this.service = app.service;
    this.middleware = app.middleware;
    this.cloud = app.cloud;
  }
}

module.exports = BaseContextClass;
