import koaRouter = require('koa-router');
import * as workflowRouter from './workflow';

export const router = new koaRouter();

router.use(
  '/workflow',
  workflowRouter.router.routes(),
  workflowRouter.router.allowedMethods(),
);
