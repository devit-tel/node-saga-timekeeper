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

export interface WorkflowDefinition = {
  name: string;
  rev: number;
  description: string;
  tasks: [any];
  failureStrategy: FailureStrategies;
  retryLimit: number;
  retryDelaySecond: number;
  recoveryWorkflowName: string;
  recoveryWorkflowRev: number;
};
