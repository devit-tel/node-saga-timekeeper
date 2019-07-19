import * as R from 'ramda';
import * as WorkflowC from './constants/workflow';
import * as CommonUtils from './utils/common';

const isNumber = R.is(Number);
const isString = R.is(String);

const isRecoveryWorkflowConfigValid = (
  workflowDefinition: WorkflowC.WorkflowDefinition,
): boolean =>
  workflowDefinition.failureStrategy ===
    WorkflowC.FailureStrategies.RecoveryWorkflow &&
  (!isString(R.path(['recoveryWorkflow', 'name'], workflowDefinition)) ||
    !isNumber(R.path(['recoveryWorkflow', 'rev'], workflowDefinition)));

const isFailureStrategiesConfigValid = (
  workflowDefinition: WorkflowC.WorkflowDefinition,
): boolean =>
  workflowDefinition.failureStrategy === WorkflowC.FailureStrategies.Retry &&
  (!isNumber(R.path(['retry', 'limit'], workflowDefinition)) ||
    !isNumber(R.path(['retry', 'delaySecond'], workflowDefinition)));

const isEmptyTasks = R.compose(
  R.isEmpty,
  R.prop('tasks'),
);
export class WorkflowDefinition implements WorkflowC.WorkflowDefinition {
  name: string;
  rev: number;
  description?: string = 'No description';
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
    if (!CommonUtils.isValidName(workflowDefinition.name)) {
      throw new Error('Name not valid');
    }

    if (!CommonUtils.isValidRev(workflowDefinition.rev)) {
      throw new Error('Rev not valid');
    }

    if (isRecoveryWorkflowConfigValid(workflowDefinition)) {
      throw new Error('Need a recoveryWorkflow');
    }

    if (isFailureStrategiesConfigValid(workflowDefinition)) {
      throw new Error('Need a retry config');
    }

    if (isEmptyTasks(workflowDefinition)) {
      throw new Error('Task cannot be empty');
    }

    Object.assign(this, workflowDefinition);
    this.tasks = workflowDefinition.tasks;
  }
}
