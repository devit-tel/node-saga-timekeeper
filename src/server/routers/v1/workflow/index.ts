import koaRouter = require('koa-router');

export const router = new koaRouter();

router.post('/:name/:rev', (ctx: koaRouter.IRouterContext) => {
  const { name, rev } = ctx.params;
  return { name, rev };
});
