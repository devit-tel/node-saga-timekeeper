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

export enum TaskStates {
  Scheduled = 'SCHEDULED',
  Completed = 'COMPLETED',
  Failed = 'FAILED',
  TimeOut = 'TIMEOUT',
  Inprogress = 'INPROGRESS',
  Paused = 'PAUSED',
}

export const TaskScheduledNextStates = [
  TaskStates.Inprogress,
  TaskStates.Paused,
];
export const TaskCompletedNextStates = [];
export const TaskFailedNextStates = [TaskStates.Scheduled];
export const TaskTimeOutNextStates = [TaskStates.Scheduled];
export const TaskInprogressNextStates = [
  TaskStates.Completed,
  TaskStates.Failed,
  TaskStates.Inprogress,
  TaskStates.TimeOut,
  TaskStates.Paused,
];
export const TaskPausedNextStates = [
  TaskStates.Completed,
  TaskStates.Failed,
  TaskStates.Inprogress,
  TaskStates.TimeOut,
  TaskStates.Paused,
];
