import * as R from 'ramda';
import { IWorkflowDefinition, AllTaskType } from '../workflowDefinition';
import { ITaskDefinition } from '../taskDefinition';
import { IWorkflow } from '../workflow';
import { ITask } from '../task';
import { WorkflowStates } from '../constants/workflow';
import { TaskStates, TaskTypes } from '../constants/task';
import { mapInputFromTaskData } from '../utils/task';
import { dispatch, sendEvent } from '../kafka';
import { ITaskUpdate, IWorkflowUpdate } from '../state';

export interface IStore {
  isHealthy(): boolean;
}

export interface IWorkflowDefinitionStore extends IStore {
  get(name: string, rev: string): Promise<IWorkflowDefinition>;
  create(workflowDefinition: IWorkflowDefinition): Promise<IWorkflowDefinition>;
  list(): Promise<IWorkflowDefinition[]>;
}

export interface ITaskDefinitionStore extends IStore {
  get(name: string): Promise<ITaskDefinition>;
  create(taskDefinition: ITaskDefinition): Promise<ITaskDefinition>;
  list(): Promise<ITaskDefinition[]>;
}

export interface IWorkflowInstanceStore extends IStore {
  get(workflowId: string): Promise<IWorkflow>;
  create(wofkflowData: IWorkflow): Promise<IWorkflow>;
  update(workflowUpdate: IWorkflowUpdate): Promise<IWorkflow>;
  delete(workflowId: string): Promise<any>;
}

export interface ITaskInstanceStore extends IStore {
  get(taskId: string): Promise<ITask>;
  getAll(workflowId: string): Promise<ITask[]>;
  create(taskData: ITask): Promise<ITask>;
  update(taskUpdate: ITaskUpdate): Promise<ITask>;
  delete(taskId: string): Promise<any>;
  deleteAll(workflowId: string): Promise<any>;
}

export class WorkflowDefinitionStore {
  client: IWorkflowDefinitionStore;

  setClient(client: IWorkflowDefinitionStore) {
    if (this.client) throw new Error('Already set client');
    this.client = client;
  }

  get(name: string, rev: string): Promise<IWorkflowDefinition> {
    return this.client.get(name, rev);
  }

  list(): Promise<IWorkflowDefinition[]> {
    return this.client.list();
  }

  create(
    workflowDefinition: IWorkflowDefinition,
  ): Promise<IWorkflowDefinition> {
    return this.client.create(workflowDefinition);
  }
}

export class TaskDefinitionStore {
  client: ITaskDefinitionStore;

  setClient(client: ITaskDefinitionStore) {
    if (this.client) throw new Error('Already set client');
    this.client = client;
  }

  get(name: string): Promise<ITaskDefinition> {
    return this.client.get(name);
  }

  list(): Promise<ITaskDefinition[]> {
    return this.client.list();
  }

  create(taskDefinition: ITaskDefinition): Promise<ITaskDefinition> {
    return this.client.create(taskDefinition);
  }
}

export class WorkflowInstanceStore {
  client: IWorkflowInstanceStore;

  setClient(client: IWorkflowInstanceStore) {
    if (this.client) throw new Error('Already set client');
    this.client = client;
  }

  get(workflowId: string): Promise<IWorkflow> {
    return this.client.get(workflowId);
  }

  create = async (
    transactionId: string,
    workflowDefinition: IWorkflowDefinition,
    input: any,
    childOf?: string,
    overideWorkflow?: IWorkflow | object,
  ): Promise<IWorkflow> => {
    const workflow = await this.client.create({
      transactionId,
      workflowId: undefined,
      status: WorkflowStates.Running,
      retries: R.pathOr(0, ['retry', 'limit'], workflowDefinition),
      input,
      output: null,
      createTime: Date.now(),
      startTime: Date.now(),
      endTime: null,
      childOf,
      workflowDefinition,
      ...overideWorkflow,
    });

    await taskInstanceStore.create(
      workflow,
      workflowDefinition.tasks[0],
      {},
      true,
    );

    return workflow;
  };

  update(workflowUpdate: IWorkflowUpdate) {
    return this.client.update(workflowUpdate);
  }

  delete(workflowId: string) {
    return this.client.delete(workflowId);
  }
}

export class TaskInstanceStore {
  client: ITaskInstanceStore;

  setClient(client: ITaskInstanceStore) {
    if (this.client) throw new Error('Already set client');
    this.client = client;
  }

  get(taskId: string) {
    return this.client.get(taskId);
  }

  getAll(workflowId: string) {
    return this.client.getAll(workflowId);
  }

  create = async (
    workflow: IWorkflow,
    workflowTask: AllTaskType,
    tasksData: { [taskReferenceName: string]: ITask },
    autoDispatch: boolean = false,
    overideTask: ITask | object = {},
  ): Promise<ITask> => {
    const task = await this.client.create({
      taskId: undefined,
      taskName: workflowTask.name,
      taskReferenceName: workflowTask.taskReferenceName,
      workflowId: workflow.workflowId,
      transactionId: workflow.transactionId,
      type: workflowTask.type,
      status: TaskStates.Scheduled,
      retries: R.pathOr(0, ['retry', 'limit'], workflowTask),
      isRetried: false,
      input: mapInputFromTaskData(workflowTask.inputParameters, {
        ...tasksData,
        workflow,
      }),
      output: {},
      createTime: Date.now(),
      startTime: autoDispatch ? Date.now() : null,
      endTime: null,
      parallelTasks:
        workflowTask.type === TaskTypes.Parallel
          ? workflowTask.parallelTasks
          : undefined,
      decisions:
        workflowTask.type === TaskTypes.Decision
          ? workflowTask.decisions
          : undefined,
      defaultDecision:
        workflowTask.type === TaskTypes.Decision
          ? workflowTask.defaultDecision
          : undefined,
      workflow:
        workflowTask.type === TaskTypes.SubWorkflow
          ? workflowTask.workflow
          : undefined,
      ...overideTask,
    });
    if (autoDispatch) {
      dispatch(
        task,
        workflow.transactionId,
        ![TaskTypes.Task, TaskTypes.Compensate].includes(workflowTask.type),
      );
      sendEvent({
        type: 'TASK',
        transactionId: workflow.transactionId,
        isError: false,
        timestamp: Date.now(),
        details: task,
      });
    }
    return task;
  };

  update = async (taskUpdate: ITaskUpdate): Promise<ITask> => {
    try {
      return await this.client.update(taskUpdate);
    } catch (error) {
      sendEvent({
        transactionId: taskUpdate.transactionId,
        type: 'TASK',
        isError: true,
        error,
        timestamp: Date.now(),
      });
      throw error;
    }
  };

  delete(taskId: string): Promise<any> {
    return this.client.delete(taskId);
  }

  deleteAll(workflowId: string): Promise<any> {
    return this.client.deleteAll(workflowId);
  }
}

// This's global instance
export const taskDefinitionStore = new TaskDefinitionStore();
export const workflowDefinitionStore = new WorkflowDefinitionStore();
export const taskInstanceStore = new TaskInstanceStore();
export const workflowInstanceStore = new WorkflowInstanceStore();
