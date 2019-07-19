import * as R from 'ramda';
import * as WorkflowC from './constants/workflow';
import * as TaskC from './constants/task';
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

const getTaskDecisions = R.compose(
  R.toPairs,
  R.propOr({}, 'decisions'),
);

interface TasksValidateOutput {
  errors: string[];
  taskReferenceNames: {
    [taskName: string]: string;
  };
}

const validateTasks = (
  tasks: WorkflowC.AllTaskType[],
  root: string,
  defaultResult: TasksValidateOutput = {
    errors: [],
    taskReferenceNames: {},
  },
) =>
  tasks.reduce(
    (
      result: TasksValidateOutput,
      task: WorkflowC.AllTaskType,
      index: number,
    ): TasksValidateOutput => {
      const currentRoot = `${root}.tasks[${index}]`;
      if (!CommonUtils.isValidName(task.name)) {
        result.errors.push(`${currentRoot}.name is invalid`);
      }

      if (!CommonUtils.isValidName(task.taskReferenceName)) {
        result.errors.push(`${currentRoot}.taskReferenceName is invalid`);
      }

      if (result.taskReferenceNames[task.taskReferenceName]) {
        result.errors.push(`${currentRoot}.taskReferenceName is duplicated`);
      } else {
        result.taskReferenceNames[task.taskReferenceName] =
          task.taskReferenceName;
      }

      // TODO Validate inputParameters

      if (task.type === TaskC.TaskTypes.Decision) {
        const defaultDecision: WorkflowC.AllTaskType[] = R.propOr(
          [],
          'defaultDecision',
          task,
        );
        if (R.isEmpty(defaultDecision)) {
          result.errors.push(`${currentRoot}.defaultDecision cannot be empty`);
        }
        const defaultDecisionResult = validateTasks(
          defaultDecision,
          `${currentRoot}.defaultDecision`,
          result,
        );

        return getTaskDecisions(task).reduce(
          (
            decisionResult: TasksValidateOutput,
            [decision, decisionTasks]: [string, WorkflowC.DecisionTask[]],
          ): TasksValidateOutput => {
            return validateTasks(
              decisionTasks,
              `${currentRoot}.decisions["${decision}"]`,
              decisionResult,
            );
          },
          defaultDecisionResult,
        );
      }

      return result;
    },
    defaultResult,
  );

export class WorkflowDefinition implements WorkflowC.WorkflowDefinition {
  name: string;
  rev: number;
  description?: string = 'No description';
  tasks: WorkflowC.AllTaskType[];
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

    const validateTasksResult = validateTasks(
      R.propOr([], 'tasks', workflowDefinition),
      'workflowDefinition',
    );
    if (validateTasksResult.errors.length) {
      throw new Error(validateTasksResult.errors.join('\n'));
    }

    Object.assign(this, workflowDefinition);
    this.tasks = workflowDefinition.tasks;
  }
}
