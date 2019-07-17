export enum WorkflowStates {
  Completed = 'COMPLETED',
  Failed = 'FAILED',
  TimeOut = 'TIMEOUT',
  Running = 'RUNNING',
  Paused = 'PAUSED',
  Cancelled = 'CANCELLED',
}

export const WorkflowCompletedNextStates = [];
export const WorkflowFailedNextStates = [];
export const WorkflowTimeOutNextStates = [];
export const WorkflowRunningNextStates = [
  WorkflowStates.Completed,
  WorkflowStates.Failed,
  WorkflowStates.Running,
  WorkflowStates.TimeOut,
  WorkflowStates.Paused,
  WorkflowStates.Cancelled,
];
export const WorkflowPausedNextStates = [
  WorkflowStates.Completed,
  WorkflowStates.Failed,
  WorkflowStates.Running,
  WorkflowStates.TimeOut,
  WorkflowStates.Paused,
  WorkflowStates.Cancelled,
];
export const WorkflowCancelledNextStates = [];
