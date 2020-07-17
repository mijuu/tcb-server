'use strict';
const TcbRouter = require('tcb-router');

class route extends TcbRouter {
  /**
   * set routes
   * @param {String|Array} path 
   * @param {Function} middleware
   */
  router(path = '*') {
    for (let i = 1, len = arguments.length; i < len; i++) {
      let handler = arguments[i];
      if (typeof handler !== 'function') {
        return console.warn('Handler should be a function. The middleware is not installed correctly.');
      }
      this._addMiddleware(path, (ctx, next) => {
        ctx.next = next;
        // bind ctx to this
        return handler.call(ctx, ctx, next);
      });
    }
  }
}
module.exports = route;
