export enum WorkflowStates {
  Completed = 'COMPLETED',
  Failed = 'FAILED',
  Timeout = 'TIMEOUT',
  Running = 'RUNNING',
  Paused = 'PAUSED',
  Cancelled = 'CANCELLED',
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
