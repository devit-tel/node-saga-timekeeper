import * as R from 'ramda';
import { IWorkflowDefinition, AllTaskType } from '../workflowDefinition';
import { ITaskDefinition } from '../taskDefinition';
import { Workflow, IWorkflow } from '../workflow';
import { Task, ITask } from '../task';
import { WorkflowStates } from '../constants/workflow';
import { TaskStates, TaskTypes } from '../constants/task';
import { mapInputFromTaskData } from '../utils/task';
import { dispatch } from '../kafka';
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
  get(workflowId: string): Promise<Workflow>;
  create(wofkflowData: IWorkflow): Promise<Workflow>;
  update(workflowUpdate: IWorkflowUpdate): Promise<Workflow>;
  delete(workflowId: string): Promise<any>;
}

export interface ITaskInstanceStore extends IStore {
  get(taskId: string): Promise<Task>;
  getAll(workflowId: string): Promise<Task[]>;
  create(taskData: ITask): Promise<Task>;
  update(taskUpdate: ITaskUpdate): Promise<Task>;
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

  get(workflowId: string): Promise<Workflow> {
    return this.client.get(workflowId);
  }

  create = async (
    transactionId: string,
    workflowDefinition: IWorkflowDefinition,
    input: any,
    childOf?: string,
    overideWorkflow?: IWorkflow | object,
  ): Promise<Workflow> => {
    const workflow = await this.client.create({
      transactionId,
      workflowId: undefined,
      workflowName: workflowDefinition.name,
      workflowRev: workflowDefinition.rev,
      status: WorkflowStates.Running,
      retries: R.pathOr(0, ['retry', 'limit'], workflowDefinition),
      input,
      output: null,
      createTime: Date.now(),
      startTime: Date.now(),
      endTime: null,
      childOf,
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
    workflow: Workflow,
    workflowTask: AllTaskType,
    tasksData: { [taskReferenceName: string]: ITask },
    autoDispatch: boolean = false,
    overideTask: ITask | object = {},
  ): Promise<Task> => {
    const task = await this.client.create({
      taskId: undefined,
      taskName: workflowTask.name,
      taskReferenceName: workflowTask.taskReferenceName,
      workflowId: workflow.workflowId,
      type: workflowTask.type,
      status: TaskStates.Scheduled,
      retries: 3,
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
      parentWorkflow: {
        name: workflow.workflowName,
        rev: workflow.workflowRev,
      },
      ...overideTask,
    });
    if (autoDispatch) dispatch(task, workflowTask.type !== TaskTypes.Task);
    return task;
  };

  update(taskUpdate: ITaskUpdate): Promise<Task> {
    return this.client.update(taskUpdate);
  }

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
