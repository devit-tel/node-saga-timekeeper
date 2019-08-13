import koaRouter = require('koa-router');
import {
  startWorkflow,
  listRunningWorkflows,
} from '../../../../domains/workflow';

export const router = new koaRouter();

router.post('/:name/:rev', (ctx: koaRouter.IRouterContext | any) => {
  const { name, rev } = ctx.params;
  return startWorkflow(name, rev, ctx.req.body);
});

router.get('/', () => {
  return listRunningWorkflows();
});
