import { getPrevState } from '../utils/constant';

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
  Rewind = 'REWIND',
  RewindThenRetry = 'REWIND_THEN_RETRY',
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

const workflowPrevStateGetter = getPrevState(WorkflowNextStates);

export const TaskPrevStates = {
  [WorkflowStates.Completed]: workflowPrevStateGetter(WorkflowStates.Completed),
  [WorkflowStates.Failed]: workflowPrevStateGetter(WorkflowStates.Failed),
  [WorkflowStates.Timeout]: workflowPrevStateGetter(WorkflowStates.Timeout),
  [WorkflowStates.Running]: workflowPrevStateGetter(WorkflowStates.Running),
  [WorkflowStates.Paused]: workflowPrevStateGetter(WorkflowStates.Paused),
  [WorkflowStates.Cancelled]: workflowPrevStateGetter(WorkflowStates.Cancelled),
};
