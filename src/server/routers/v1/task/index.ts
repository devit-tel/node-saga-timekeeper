import koaRouter = require('koa-router');
import { listRunningTasks } from '../../../../domains/task';

export const router = new koaRouter();

router.get('/', () => {
  return listRunningTasks();
});
