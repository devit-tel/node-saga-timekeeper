export enum TaskTypes {
  Task = 'TASK',
  Parallel = 'PARALLEL',
  SubWorkflow = 'SUB_WORKFLOW',
  Decision = 'DECISION',
}

export enum FailureStrategies {
  Failed = 'FAILED',
  RecoveryWorkflow = 'RECOVERY_WORKFLOW',
  Retry = 'RETRY',
  Ignore = 'IGNORE',
}

export enum TaskStates {
  Scheduled = 'SCHEDULED',
  Completed = 'COMPLETED',
  Failed = 'FAILED',
  Timeout = 'TIMEOUT',
  Inprogress = 'INPROGRESS',
  Paused = 'PAUSED',
}

export const TaskScheduledNextStates = [
  TaskStates.Inprogress,
  TaskStates.Paused,
];
export const TaskCompletedNextStates = [];
export const TaskFailedNextStates = [TaskStates.Scheduled];
export const TaskTimeoutNextStates = [TaskStates.Scheduled];
export const TaskInprogressNextStates = [
  TaskStates.Completed,
  TaskStates.Failed,
  TaskStates.Inprogress,
  TaskStates.Timeout,
  TaskStates.Paused,
];
export const TaskPausedNextStates = [
  TaskStates.Completed,
  TaskStates.Failed,
  TaskStates.Inprogress,
  TaskStates.Timeout,
  TaskStates.Paused,
];

export interface TaskDefinition {
  name: string;
  description: string;
  partitionsCount: number;
  topicConfiguration: any;
  responseTimeoutSecond: number;
  timeoutSecond: number;
  timeoutStrategy: FailureStrategies;
  failureStrategy: FailureStrategies;
  retryLimit: number;
  retryDelaySecond: number;
  recoveryWorkflowName: string;
  recoveryWorkflowRev: number;
}
