import koaRouter = require('koa-router');
import {
  createTaskDefinition,
  getTaskDefinition,
  listTaskDefinition,
} from '../../../../domains/definitions/task';

export const router = new koaRouter();

router.post('/', (ctx: koaRouter.IRouterContext | any) => {
  return createTaskDefinition(ctx.request.body);
});

router.get('/:name', (ctx: koaRouter.IRouterContext) => {
  const { name } = ctx.params;
  return getTaskDefinition(name);
});

router.get('/', () => {
  return listTaskDefinition();
});
