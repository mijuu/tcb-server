'use strict';
const TcbRouter = require('tcb-router');

class TcbServerRouter extends TcbRouter {
  /**
   * start the route server
   */
  serve(event, ctx) {
      ctx.request = { event, url: event.path };
      let _routerMiddlewares = this._routerMiddlewares;
      let url = ctx.request.url;

      // try to  match path
      if (_routerMiddlewares.hasOwnProperty(url)
          || _routerMiddlewares.hasOwnProperty('*')) {
          let middlewares = (_routerMiddlewares[url]) ? _routerMiddlewares[url].middlewares : [];
          // put * path middlewares on the queue head
          if (_routerMiddlewares['*']) {
              middlewares = [].concat(_routerMiddlewares['*'].middlewares, middlewares);
          }

          const fn = compose(middlewares);

          return new Promise((resolve, reject) => {
              fn(ctx).then(() => {
                  resolve(ctx.body);
              }).catch(reject);
          });
      }
      else {
          return new Promise((resolve) => {
              resolve();
          });
      }

  }
}

function compose(middleware) {
  if (!Array.isArray(middleware)) {
      throw new TypeError('Middleware must be an array!');
  }
  for (const fn of middleware) {
      if (typeof fn !== 'function') {
          throw new TypeError('Handler should be a function. The middleware is not installed correctly.');
      }
  }

  /**
   * @param {Object} context
   * @return {Promise}
   * @api public
   */

  return function (context, next) {
      // parameter 'next' is empty when this the main flow
      // last called middleware #
      let index = -1;

      // dispatch the first middleware
      return dispatch(0);

      function dispatch(i) {
          if (i <= index) {
              return Promise.reject(new Error('next() called multiple times'));
          }

          index = i;

          // get the handler and path of the middlware
          let handler = middleware[i];

          // reach the end, call the last handler 
          if (i === middleware.length) {
              handler = next;
          }

          // if handler is missing, just return Promise.resolve
          if (!handler) {
              return Promise.resolve();
          }

          try {
              // handle request, call handler one by one using dispatch
              // Promise.resolve will help trigger the handler to be invoked
              return Promise.resolve(handler(context, dispatch.bind(null, i + 1)));
          }
          catch (err) {
              return Promise.reject(err);
          }
      }
  }
}

module.exports = TcbServerRouter;