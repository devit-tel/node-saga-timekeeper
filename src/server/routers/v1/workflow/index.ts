import koaRouter = require('koa-router');
import {
  startWorkflow,
  listRunningWorkflows,
} from '../../../../domains/workflow';

export const router = new koaRouter();

router.post('/:name/:rev', (ctx: koaRouter.IRouterContext | any) => {
  const { name, rev } = ctx.params;
  // tslint:disable-next-line: prefer-array-literal
  return new Array(1)
    .fill('')
    .map(() => startWorkflow(name, rev, ctx.request.body));
});

router.get('/', () => {
  return listRunningWorkflows();
});
