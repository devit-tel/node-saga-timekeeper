import { TaskTypes, TaskDefinition } from './task';

export enum WorkflowStates {
  Completed = 'COMPLETED',
  Failed = 'FAILED',
  Timeout = 'TIMEOUT',
  Running = 'RUNNING',
  Paused = 'PAUSED',
  Cancelled = 'CANCELLED',
}

export enum FailureStrategies {
  Failed = 'FAILED',
  RecoveryWorkflow = 'RECOVERY_WORKFLOW',
  Retry = 'RETRY',
  Rewide = 'REWIDE',
}

export const WorkflowCompletedNextStates = [];
export const WorkflowFailedNextStates = [WorkflowStates.Running];
export const WorkflowTimeoutNextStates = [WorkflowStates.Running];
export const WorkflowRunningNextStates = [
  WorkflowStates.Completed,
  WorkflowStates.Failed,
  WorkflowStates.Running,
  WorkflowStates.Timeout,
  WorkflowStates.Paused,
  WorkflowStates.Cancelled,
];
export const WorkflowPausedNextStates = [
  WorkflowStates.Completed,
  WorkflowStates.Failed,
  WorkflowStates.Running,
  WorkflowStates.Timeout,
  WorkflowStates.Cancelled,
];
export const WorkflowCancelledNextStates = [WorkflowStates.Running];

export interface BaseTask {
  name: string;
  taskReferenceName: string;
  overideOptions?: TaskDefinition;
  inputParameters: {
    [key: string]: string | number;
  };
}

export interface Task extends BaseTask {
  type: TaskTypes.Task;
}

export interface ParallelTask extends BaseTask {
  type: TaskTypes.Parallel;
  parallelTasks: (Task | ParallelTask | SubWorkflowTask | DecisionTask)[][];
}
export interface SubWorkflowTask extends BaseTask {
  type: TaskTypes.SubWorkflow;
  workflow: {
    name: string;
    rev: number;
  };
}

export interface DecisionTask extends BaseTask {
  type: TaskTypes.Decision;
  decisions: {
    [decision: string]: Task | ParallelTask | SubWorkflowTask;
  };
  defaultDecision: Task | ParallelTask | SubWorkflowTask;
}

export interface WorkflowDefinition {
  name: string;
  rev: number;
  description?: string;
  tasks: (Task | ParallelTask | SubWorkflowTask | DecisionTask)[];
  failureStrategy?: FailureStrategies;
  retry?: {
    limit: number;
    delaySecond: number;
  };
  recoveryWorkflow?: {
    name: string;
    rev: number;
  };
}
