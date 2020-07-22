# tcb-server

[![NPM version][npm-image]][npm-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/tcb-server.svg?style=flat-square
[npm-url]: https://npmjs.org/package/tcb-server
[download-image]: https://img.shields.io/npm/dm/tcb-server.svg?style=flat-square
[download-url]: https://npmjs.org/package/tcb-server

腾讯云开发 轻量服务端辅助框架，旨在使用单云函数实例实现多个接口，管理云服务端逻辑，节省函数资源，减少项目中冷启动函数导致的体验下降。

## 使用方法

```bash
npm install --save tcb-server
```

```javascript
// index.js
const TcbServer = require('tcb-server').Application;
const router = require('./router');
const app = new TcbServer({
  env: 'your env',
  secretId: 'your secretId',
  secretKey: 'your secretKey'
});

exports.main = async (event) => {
  return app.serve({
    event,
    router
  });
};
```

```javascript
// router.js
module.exports = app => {
  // controller, middleware, service目录下的js文件无需引用，可以直接在router中使用
  const { controller, middleware } = app;

  // 路由的使用方法参考[tcb-router](https://github.com/TencentCloudBase/tcb-router)
  app.router('/v1/todo/create', controller.v1.todo.create);
}
```

```javascript
// controller/v1/todo.js
// BaseContextClass基类构造了app,ctx,controller,service,cloud这些对象，辅助开发使用
const BaseContextClass = require('tcb-server').BaseContextClass;
class Todo extends BaseContextClass {
  async create () {
    const { ctx } = this;
    ctx.body = 'hello world!';
  }
 }
```
至此，一个最基本的多接口云函数结构就完成了

## router的使用
router继承自[tcb-router](https://github.com/TencentCloudBase/tcb-router)
但输入的$url变量名称改为了path，输出的_req名称改为request

## BaseContextClass辅助对象

#### app
app作为根对象，挂载了所有其他对象，直接使用app来获取你要的对象也是可以的

#### ctx
ctx中挂载了用户的请求，具体结构为：
```javascript
ctx.request = { event, context, path: event.path }
```

#### controller
用于放置项目的输入输出代码，检查和整理用户的请求，接收service处理好的数据，按需求返回给用户

#### service
用于放置项目的逻辑代码，操作数据库与存储，处理数据

#### middleware
用于放置中间件，在事务流程中可以用来控制或清洗数据，完成后转至下一个路由环节

## 最佳实例

目录结构
```
├── package.json
├── index.js
├── router.js
├── controller
│   └── v1
│       └── todo.js
├── service
│   └── v1
│       └── todo.js
├── middleware
│   └── auth.js
|
├── config
|   └── index.js
```

具体案例可以参考代码中的example目录
