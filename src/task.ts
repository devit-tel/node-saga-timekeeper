import * as uuid from 'uuid/v4';
import * as R from 'ramda';
import { TaskStates } from './constants/task';
import { AllTaskType } from './workflowDefinition';
import { dispatch } from './kafka';

export interface ITask {
  taskName: string;
  taskReferenceNames: string;
  taskId: string;
  workflowId: string;
  status: TaskStates;
  retryCount: number;
  input: {
    [key: string]: any;
  };
  output: any;
  createTime: number; // time that push into Kafka
  startTime: number; // time that worker ack
  endTime: number; // time that task finish/failed/cancel
  logs?: any[];
}

export class Task implements ITask {
  taskName: string;
  taskReferenceNames: string;
  taskId: string;
  workflowId: string;
  status: TaskStates = TaskStates.Scheduled;
  retryCount: number = 0;
  input: {
    [key: string]: any;
  };
  output: any = {};
  createTime: number; // time that push into Kafka
  startTime: number = null; // time that worker ack
  endTime: number = null; // time that task finish/failed/cancel
  logs?: any[] = [];

  constructor(
    workflowId: string,
    task: AllTaskType,
    tasksData: { [taskReferenceName: string]: ITask },
  ) {
    this.taskName = task.name;
    this.taskReferenceNames = task.taskReferenceName;
    this.taskId = uuid();
    this.workflowId = workflowId;
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
      ],
      this,
    );
  };

  toJSON = (): string => {
    return JSON.stringify(this.toObject());
  };
}
