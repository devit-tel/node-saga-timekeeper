import koaRouter = require('koa-router');
import * as taskDefinitionRouter from './task';

export const router = new koaRouter();

router.use(
  '/task',
  taskDefinitionRouter.router.routes(),
  taskDefinitionRouter.router.allowedMethods(),
);
