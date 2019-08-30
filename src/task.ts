import * as R from 'ramda';
import { TaskStates, TaskTypes } from './constants/task';
import { AllTaskType } from './workflowDefinition';

export interface ITask {
  taskName: string;
  taskReferenceName: string;
  taskId: string;
  workflowId: string;
  status: TaskStates;
  retries: number;
  isRetried: boolean;
  input: any;
  output: any;
  createTime: number; // time that push into Kafka
  startTime: number; // time that worker ack
  endTime: number; // time that task finish/failed/cancel
  logs?: any[];
  type: TaskTypes;
  parallelTasks?: AllTaskType[][];
  workflow?: {
    name: string;
    rev: string;
  };
  decisions?: {
    [decision: string]: AllTaskType[];
  };
  defaultDecision?: AllTaskType[];
  delay?: number;
}

export class Task implements ITask {
  taskName: string;
  taskReferenceName: string;
  taskId: string;
  workflowId: string;
  status: TaskStates = TaskStates.Scheduled;
  retries: number;
  isRetried: boolean;
  input: any;
  output: any = {};
  createTime: number; // time that push into Kafka
  startTime: number = null; // time that worker ack
  endTime: number = null; // time that task finish/failed/cancel
  logs?: any[] = [];
  type: TaskTypes;
  parallelTasks?: AllTaskType[][];
  workflow?: {
    name: string;
    rev: string;
  };
  decisions?: {
    [decision: string]: AllTaskType[];
  };
  defaultDecision?: AllTaskType[];
  delay: number = 0;

  constructor(task: ITask) {
    Object.assign(this, task);
  }

  toObject = (): any => {
    return R.pick(
      [
        'taskName',
        'taskReferenceName',
        'taskId',
        'workflowId',
        'status',
        'retryCount',
        'input',
        'output',
        'createTime',
        'startTime',
        'endTime',
        'logs',
        'type',
        'parallelTasks',
        'workflow',
        'decisions',
        'defaultDecision',
      ],
      this,
    );
  };

  toJSON = (): string => {
    return JSON.stringify(this.toObject());
  };
}
