import * as R from 'ramda';
import * as uuid from 'uuid/v4';
import { IWorkflowDefinition } from './workflowDefinition';
import { WorkflowStates } from './constants/workflow';
import { getWorkflowTask } from './state';
import { ITask, Task } from './task';

export interface IWorkflow {
  workflowName: string;
  workflowRev: number;
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
  workflowRev: number;
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
  taskData: { [taskReferenceName: string]: ITask };

  constructor(
    workflowDefinition: IWorkflowDefinition,
    input: {
      [key: string]: any;
    },
    taskData: { [taskReferenceName: string]: ITask },
  ) {
    this.workflowDefinition = workflowDefinition;
    this.taskData = taskData;

    this.workflowName = workflowDefinition.name;
    this.workflowRev = workflowDefinition.rev;
    this.workflowId = uuid();
    this.status = WorkflowStates.Running;
    this.retryCount = 0;
    this.input = input;
    this.createTime = Date.now();
    this.startTime = Date.now();
    this.endTime = null;
  }

  async startNextTask(taskReferenceNames?: string) {
    const workflowTask = getWorkflowTask(
      taskReferenceNames ||
        R.pathOr('', ['tasks', 0, 'name'], this.workflowDefinition),
      this.workflowDefinition,
    );
    if (workflowTask) {
      const task = new Task(this.workflowId, workflowTask, this.taskData);
      await task.dispatch();
    }
  }
}
