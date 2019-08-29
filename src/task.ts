import * as uuid from 'uuid/v4';
import * as R from 'ramda';
import { TaskStates, TaskTypes } from './constants/task';
import { AllTaskType } from './workflowDefinition';
import { dispatch } from './kafka';
import { IWorkflow } from './workflow';
import { mapInputFromTaskData } from './utils/task';

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

  constructor(task: ITask) {
    Object.assign(this, task);
  }

  dispatch() {
    dispatch(this, this.type !== TaskTypes.Task);
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

export class TaskFromWorkflow extends Task {
  constructor(
    workflowId: string,
    task: AllTaskType,
    tasksData: { [taskReferenceName: string]: ITask | IWorkflow },
  ) {
    super({
      taskName: task.name,
      taskReferenceName: task.taskReferenceName,
      taskId: uuid(),
      workflowId: workflowId,
      type: task.type,
      status: TaskStates.Scheduled,
      retryCount: 0,
      input: mapInputFromTaskData(task.inputParameters, tasksData),
      output: {},
      createTime: Date.now(),
      startTime: null,
      endTime: null,
      parallelTasks:
        task.type === TaskTypes.Parallel ? task.parallelTasks : undefined,
      decisions: task.type === TaskTypes.Decision ? task.decisions : undefined,
      defaultDecision:
        task.type === TaskTypes.Decision ? task.defaultDecision : undefined,
      workflow: task.type === TaskTypes.SubWorkflow ? task.workflow : undefined,
    });
  }
}
