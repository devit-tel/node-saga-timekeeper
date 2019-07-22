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

const isValidWorkflowName = R.compose(
  CommonUtils.isValidName,
  R.pathOr('', ['workflow', 'name']),
);

const isValidWorkflowRev = R.compose(
  CommonUtils.isValidRev,
  R.path(['workflow', 'rev']),
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

      if (!TaskC.TaskTypesList.includes(task.type)) {
        result.errors.push(`${currentRoot}.type is invalid`);
      }

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
            [decision, decisionTasks]: [string, WorkflowC.AllTaskType[]],
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

      if (task.type === TaskC.TaskTypes.Parallel) {
        const parallelTasks: WorkflowC.AllTaskType[][] = R.propOr(
          [],
          'parallelTasks',
          task,
        );

        return parallelTasks.reduce(
          (
            parallelResult: TasksValidateOutput,
            parallelTasks: WorkflowC.AllTaskType[],
            index: number,
          ): TasksValidateOutput => {
            return validateTasks(
              parallelTasks,
              `${currentRoot}.parallelTasks[${index}]`,
              parallelResult,
            );
          },
          result,
        );
      }

      if (task.type === TaskC.TaskTypes.SubWorkflow) {
        if (!isValidWorkflowName(task)) {
          result.errors.push(`${currentRoot}.workflow.name is invalid`);
        }

        if (!isValidWorkflowRev(task)) {
          result.errors.push(`${currentRoot}.workflow.rev is invalid`);
        }

        // TODO check if workflow/rev is exists
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
