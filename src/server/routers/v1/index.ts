import koaRouter = require('koa-router');
import * as workflowRouter from './workflow';
import * as taskRouter from './task';
import * as definitionRouter from './definition';

export const router = new koaRouter();

router.use(
  '/workflow',
  workflowRouter.router.routes(),
  workflowRouter.router.allowedMethods(),
);

router.use(
  '/task',
  taskRouter.router.routes(),
  taskRouter.router.allowedMethods(),
);

router.use(
  '/definition',
  definitionRouter.router.routes(),
  definitionRouter.router.allowedMethods(),
);
