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
  RewideThenRetry = 'REWIDE_THEN_RETRY',
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
