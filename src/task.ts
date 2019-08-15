import * as uuid from 'uuid/v4';
import * as R from 'ramda';
import { TaskStates, TaskTypes } from './constants/task';
import { AllTaskType } from './workflowDefinition';
import { dispatch } from './kafka';

export interface ITask {
  taskName: string;
  taskReferenceNames: string;
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
  taskReferenceNames: string;
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
    tasksData: { [taskReferenceName: string]: ITask },
  ) {
    this.taskName = task.name;
    this.taskReferenceNames = task.taskReferenceName;
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
    // TODO inject input later
    this.input = tasksData;
    this.createTime = Date.now();
  }

  dispatch() {
    dispatch(this);
  }

  toObject = (): any => {
    return R.pick(
      [
        'taskName',
        'taskReferenceNames',
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
