import * as uuid from 'uuid/v4';
import * as TaskC from './constants/task';
import * as WorkflowC from './constants/workflow';

export class Task implements TaskC.Task {
  taskName: string;
  taskReferenceNames: string;
  taskId: string;
  workflowId: string;
  status: TaskC.TaskStates = TaskC.TaskStates.Scheduled;
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
    task: WorkflowC.AllTaskType,
    tasksData: { [taskReferenceName: string]: TaskC.Task },
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
    // Dispatch command to worker
  }
}
