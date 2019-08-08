import koaRouter = require('koa-router');
import * as taskDefinitionRouter from './task';
import * as workflowDefinitionRouter from './workflow';

export const router = new koaRouter();

router.use(
  '/task',
  taskDefinitionRouter.router.routes(),
  taskDefinitionRouter.router.allowedMethods(),
);

router.use(
  '/workflow',
  workflowDefinitionRouter.router.routes(),
  workflowDefinitionRouter.router.allowedMethods(),
);
