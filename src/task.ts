import * as uuid from 'uuid/v4';
import * as R from 'ramda';
import { TaskStates, TaskTypes } from './constants/task';
import { AllTaskType } from './workflowDefinition';
import { dispatch } from './kafka';
import { IWorkflow } from './workflow';
import { isString } from './utils/common';

export interface ITask {
  taskName: string;
  taskReferenceName: string;
  taskId: string;
  workflowId: string;
  status: TaskStates;
  retryCount: number;
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
}

export class Task implements ITask {
  taskName: string;
  taskReferenceName: string;
  taskId: string;
  workflowId: string;
  status: TaskStates = TaskStates.Scheduled;
  retryCount: number = 0;
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

  constructor(
    workflowId: string,
    task: AllTaskType,
    tasksData: { [taskReferenceName: string]: ITask | IWorkflow },
  ) {
    this.taskName = task.name;
    this.taskReferenceName = task.taskReferenceName;
    this.taskId = uuid();
    this.workflowId = workflowId;
    this.type = task.type;

    if (task.type === TaskTypes.Parallel)
      this.parallelTasks = task.parallelTasks;
    if (task.type === TaskTypes.Decision) {
      this.decisions = task.decisions;
      this.defaultDecision = task.defaultDecision;
    }
    if (task.type === TaskTypes.SubWorkflow) this.workflow = task.workflow;

    const inputParametersPairs = R.toPairs(task.inputParameters);
    const inputPairs = inputParametersPairs.map(
      ([key, value]: [string, string | any]): [string, any] => {
        if (
          isString(value) &&
          /^\${[a-z0-9-_]{1,32}[a-z0-9-_.]+}$/i.test(value)
        ) {
          return [
            key,
            R.path(
              value.replace(/(^\${)(.+)(}$)/i, '$2').split('.'),
              tasksData,
            ),
          ];
        }
        return [key, value];
      },
    );
    this.input = R.fromPairs(inputPairs);
    this.createTime = Date.now();
  }

  dispatch() {
    dispatch(this);
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
