'use strict';

module.exports = async function(ctx, next) {
  ctx.cloudUserInfo = await cloud.auth().getUserInfo();
  const uid = ctx.cloudUserInfo.uid;
  if (uid) {
    await next();
  } else {
    ctx.body = {
      code: 40000,
      message: 'you need to login first'
    }
  }
}
