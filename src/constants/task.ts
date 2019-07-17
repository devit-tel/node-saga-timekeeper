export enum TaskTypes {
  Task = 'TASK',
  Parallel = 'PARALLEL',
  SubWorkflow = 'SUB_WORKFLOW',
  Decision = 'DECISION',
}

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
