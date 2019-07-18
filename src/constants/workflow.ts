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
export const WorkflowFailedNextStates = [];
export const WorkflowTimeoutNextStates = [];
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
  WorkflowStates.Paused,
  WorkflowStates.Cancelled,
];
export const WorkflowCancelledNextStates = [];

export interface Task {
  name: string;
  type: TaskTypes;
  taskReferenceName: string;
  overideOptions?: TaskDefinition;
  inputParameters: {
    [key: string]: string | number;
  };
}

export interface ParallelTask extends Task {
  parallelTasks: (Task | ParallelTask | SubWorkflowTask | DecisionTask)[][];
}
export interface SubWorkflowTask extends Task {
  workflow: {
    name: string;
    ref: number;
  };
}

export interface DecisionTask extends Task {
  decisions: {
    [decision: string]: Task | ParallelTask | SubWorkflowTask;
  };
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
