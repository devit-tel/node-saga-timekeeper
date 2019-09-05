import koaRouter = require('koa-router');
import { startTransaction } from '../../../../domains/transaction';

export const router = new koaRouter();

router.post('/:name/:rev', (ctx: koaRouter.IRouterContext | any) => {
  const { name, rev } = ctx.params;
  return Promise.all(
    // tslint:disable-next-line: prefer-array-literal
    new Array(1)
      .fill('')
      .map(() => startTransaction(name, rev, ctx.request.body)),
  );
});
