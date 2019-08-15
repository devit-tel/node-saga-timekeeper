import * as R from 'ramda';
import * as uuid from 'uuid/v4';
import { IWorkflowDefinition, AllTaskType } from './workflowDefinition';
import { WorkflowStates } from './constants/workflow';
import { taskInstanceStore } from './store';
import { Task } from './task';

export interface IWorkflow {
  workflowName: string;
  workflowRev: string;
  workflowId: string;
  status: WorkflowStates;
  retryCount: number;
  input: {
    [key: string]: any;
  };
  output: any;
  createTime: number;
  startTime: number;
  endTime: number;
}

export class Workflow implements IWorkflow {
  workflowName: string;
  workflowRev: string;
  workflowId: string;
  status: WorkflowStates;
  retryCount: number;
  input: {
    [key: string]: any;
  };
  output: any;
  createTime: number;
  startTime: number;
  endTime: number;

  workflowDefinition: IWorkflowDefinition;

  constructor(
    workflowDefinition: IWorkflowDefinition,
    input: {
      [key: string]: any;
    },
    workflow?: IWorkflow,
  ) {
    this.workflowDefinition = workflowDefinition;
    this.workflowName = workflowDefinition.name;
    this.workflowRev = workflowDefinition.rev;

    if (workflow) {
      this.workflowId = workflow.workflowId;
      this.status = workflow.status;
      this.retryCount = workflow.retryCount;
      this.input = workflow.input;
      this.createTime = workflow.createTime;
      this.startTime = workflow.startTime;
      this.endTime = workflow.endTime;
    } else {
      this.workflowId = uuid();
      this.status = WorkflowStates.Running;
      this.retryCount = 0;
      this.input = input;
      this.createTime = Date.now();
      this.startTime = Date.now();
      this.endTime = null;
    }
  }

  async startTask(taskPath: (string | number)[] = [0]) {
    const workflowTask: AllTaskType = R.path(
      taskPath,
      this.workflowDefinition.tasks,
    );
    if (workflowTask) {
      const task = new Task(this.workflowId, workflowTask, {});
      await taskInstanceStore.setValue(task.taskId, task);
      await task.dispatch();
    } else {
      throw new Error(`WorkflowTask @${taskPath} not found`);
    }
  }

  toObject = (): any => {
    return R.pick(
      [
        'workflowName',
        'workflowRev',
        'workflowId',
        'status',
        'retryCount',
        'input',
        'output',
        'createTime',
        'startTime',
        'endTime',
      ],
      this,
    );
  };

  toJSON = (): string => {
    return JSON.stringify(this.toObject());
  };
}
