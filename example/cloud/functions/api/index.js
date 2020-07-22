'use strict';
const TcbServer = require('tcb-server').Application;
const config = require('./config');
const router = require('./router');

const app = new TcbServer(config);

// 如需本地测试可以使用以下代码
// const event = { path: '/v1/todo/create', data: { label: 'new' } }
// const event = { path: '/v1/todo/delete', data: { _id: '2b1d787a5f13c8e3000139ec15d6ab7a' } }
// const event = { path: '/v1/todo/edit', data: { _id: '2b1d787a5f13c8e3000139ec15d6ab7a', completed: false } }
// const event = { path: '/v1/todo/list', data: { page: 1, size: 10} }
// return app.serve({
//   event,
//   router
// }).then(response => {
//   console.log('response:', response);
// });
exports.main = async (event) => {
  return app.serve({
    event,
    router
  });
};
