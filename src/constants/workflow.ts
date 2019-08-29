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

export const WorkflowNextStates = {
  [WorkflowStates.Completed]: [],
  [WorkflowStates.Failed]: [WorkflowStates.Running],
  [WorkflowStates.Timeout]: [WorkflowStates.Running],
  [WorkflowStates.Running]: [
    WorkflowStates.Completed,
    WorkflowStates.Failed,
    WorkflowStates.Running,
    WorkflowStates.Timeout,
    WorkflowStates.Paused,
    WorkflowStates.Cancelled,
  ],
  [WorkflowStates.Paused]: [
    WorkflowStates.Completed,
    WorkflowStates.Failed,
    WorkflowStates.Running,
    WorkflowStates.Timeout,
    WorkflowStates.Cancelled,
  ],
  [WorkflowStates.Cancelled]: [WorkflowStates.Running],
};
