import * as R from 'ramda';
import * as uuid from 'uuid/v4';
import * as WorkflowC from './constants/workflow';
import * as TaskC from './constants/task';
import * as State from './state';
import * as Task from './task';
export class Workflow implements WorkflowC.Workflow {
  workflowName: string;
  workflowRev: number;
  workflowId: string;
  status: WorkflowC.WorkflowStates;
  retryCount: number;
  input: {
    [key: string]: any;
  };
  output: any;
  createTime: number;
  startTime: number;
  endTime: number;

  workflowDefinition: WorkflowC.WorkflowDefinition;
  taskData: { [taskReferenceName: string]: TaskC.Task };

  constructor(
    workflowDefinition: WorkflowC.WorkflowDefinition,
    input: {
      [key: string]: any;
    },
    taskData: { [taskReferenceName: string]: TaskC.Task },
  ) {
    this.workflowDefinition = workflowDefinition;
    this.taskData = taskData;

    this.workflowName = workflowDefinition.name;
    this.workflowRev = workflowDefinition.rev;
    this.workflowId = uuid();
    this.status = WorkflowC.WorkflowStates.Running;
    this.retryCount = 0;
    this.input = input;
    this.createTime = Date.now();
    this.startTime = Date.now();
    this.endTime = null;
  }

  async startNextTask(taskReferenceNames?: string) {
    const workflowTask = State.getWorkflowTask(
      taskReferenceNames ||
        R.pathOr('', ['tasks', 0, 'name'], this.workflowDefinition),
      this.workflowDefinition,
    );
    if (workflowTask) {
      const task = new Task.Task(this.workflowId, workflowTask, this.taskData);
      await task.dispatch();
    }
  }
}
