import * as R from 'ramda';
import * as uuid from 'uuid/v4';
import { IWorkflowDefinition, AllTaskType } from './workflowDefinition';
import { WorkflowStates } from './constants/workflow';
import { taskInstanceStore, workflowInstanceStore } from './store';
import { Task } from './task';
import { enumToList } from './utils/common';

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
  taskRefs: {
    [taskId: string]: string;
  };
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
  taskRefs: {
    [taskId: string]: string;
  };

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

    // Node TS didn't support constructor overloading
    if (workflow) {
      // From store
      this.workflowId = workflow.workflowId;
      this.status = workflow.status;
      this.retryCount = workflow.retryCount;
      this.input = workflow.input;
      this.createTime = workflow.createTime;
      this.startTime = workflow.startTime;
      this.endTime = workflow.endTime;
      this.taskRefs = workflow.taskRefs;
    } else {
      // Create new one
      this.workflowId = uuid();
      this.status = WorkflowStates.Running;
      this.retryCount = 0;
      this.input = input;
      this.createTime = Date.now();
      this.startTime = Date.now();
      this.endTime = null;
      this.taskRefs = {};
    }
  }

  async startTask(
    taskPath: (string | number)[] = [0],
    taskData: { [taskReferenceName: string]: Task | Workflow } = {},
  ) {
    const workflowTask: AllTaskType = R.path(
      taskPath,
      this.workflowDefinition.tasks,
    );
    if (workflowTask) {
      const task = new Task(this.workflowId, workflowTask, {
        workflow: this,
        ...taskData,
      });
      this.taskRefs = {
        ...this.taskRefs,
        [task.taskReferenceName]: task.taskId,
      };
      await Promise.all([
        taskInstanceStore.setValue(task.taskId, task),
        workflowInstanceStore.setValue(this.workflowId, this),
      ]);
      await task.dispatch();
    } else {
      throw new Error(`WorkflowTask @${taskPath} not found`);
    }
  }

  destroy = async (): Promise<any> => {
    const taskIds = enumToList(this.taskRefs);
    await Promise.all([
      ...taskIds.map((taskId: string) => taskInstanceStore.unsetValue(taskId)),
      workflowInstanceStore.unsetValue(this.workflowId),
    ]);
  };

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
        'taskRefs',
      ],
      this,
    );
  };

  toJSON = (): string => {
    return JSON.stringify(this.toObject());
  };
}
