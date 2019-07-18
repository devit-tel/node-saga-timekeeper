import * as R from 'ramda';
import * as WorkflowC from './constants/workflow';

const isRecoveryWorkflowConfigValid = (
  workflowDefinition: WorkflowC.WorkflowDefinition,
): boolean =>
  workflowDefinition.failureStrategy ===
    WorkflowC.FailureStrategies.RecoveryWorkflow &&
  (R.isNil(R.path(['recoveryWorkflow', 'name'], workflowDefinition)) ||
    R.isNil(R.path(['recoveryWorkflow', 'ref'], workflowDefinition)));

const isFailureStrategiesConfigValid = (
  workflowDefinition: WorkflowC.WorkflowDefinition,
): boolean =>
  workflowDefinition.failureStrategy === WorkflowC.FailureStrategies.Retry &&
  (R.isNil(R.path(['retry', 'limit'], workflowDefinition)) ||
    R.isNil(R.path(['retry', 'delaySecond'], workflowDefinition)));

export class WorkflowDefinition implements WorkflowC.WorkflowDefinition {
  name: string;
  rev: number;
  description?: string;
  tasks: (
    | WorkflowC.Task
    | WorkflowC.ParallelTask
    | WorkflowC.SubWorkflowTask
    | WorkflowC.DecisionTask)[];
  failureStrategy?: WorkflowC.FailureStrategies;
  retry?: {
    limit: number;
    delaySecond: number;
  };
  recoveryWorkflow?: {
    name: string;
    rev: number;
  };

  constructor(workflowDefinition: WorkflowC.WorkflowDefinition) {
    if (isRecoveryWorkflowConfigValid(workflowDefinition)) {
      throw new Error('Need a recoveryWorkflow');
    }

    if (isFailureStrategiesConfigValid(workflowDefinition)) {
      throw new Error('Need a retry config');
    }

    Object.assign(this, workflowDefinition);
  }
}
