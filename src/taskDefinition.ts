import * as R from 'ramda';
import { TopicConfigurations, FailureStrategies } from './constants/task';
import { isValidName } from './utils/common';

export interface ITaskDefinitionData {
  name: string;
  description?: string;
  partitionsCount?: number;
  topicConfigurations?: TopicConfigurations;
  responseTimeoutSecond?: number;
  timeoutSecond?: number;
  timeoutStrategy?: FailureStrategies;
  failureStrategy?: FailureStrategies;
  retry?: {
    limit: number;
    delaySecond: number;
  };
  recoveryWorkflow?: {
    name: string;
    rev: string;
  };
  inputParameters?: {
    [key: string]: any;
  };
}

export interface ITaskDefinition extends ITaskDefinitionData {
  toObject(): any;
  toJSON(): string;
}

const defaultTopicConfigurations = {
  'cleanup.policy': 'compact',
  'compression.type': 'snappy',
  'delete.retention.ms': 86400000,
  'file.delete.delay.ms': 60000,
};

const isNumber = R.is(Number);
const isString = R.is(String);

const isRecoveryWorkflowConfigValid = (
  taskDefinition: ITaskDefinitionData,
): boolean =>
  (taskDefinition.timeoutStrategy === FailureStrategies.RecoveryWorkflow ||
    taskDefinition.failureStrategy === FailureStrategies.RecoveryWorkflow) &&
  (!isString(R.path(['recoveryWorkflow', 'name'], taskDefinition)) ||
    !isString(R.path(['recoveryWorkflow', 'rev'], taskDefinition)));

const isFailureStrategiesConfigValid = (
  taskDefinition: ITaskDefinitionData,
): boolean =>
  (taskDefinition.timeoutStrategy === FailureStrategies.Retry ||
    taskDefinition.failureStrategy === FailureStrategies.Retry) &&
  (!isNumber(R.path(['retry', 'limit'], taskDefinition)) ||
    !isNumber(R.path(['retry', 'delaySecond'], taskDefinition)));

const taskValidation = (taskDefinition: ITaskDefinitionData): string[] => {
  const errors = [];
  if (!isValidName(taskDefinition.name))
    errors.push('taskDefinition.name is invalid');

  if (isRecoveryWorkflowConfigValid(taskDefinition))
    errors.push('taskDefinition.recoveryWorkflow is invalid');

  if (isFailureStrategiesConfigValid(taskDefinition))
    errors.push('taskDefinition.retry is invalid');

  return errors;
};

export class TaskDefinition implements ITaskDefinition {
  name: string;
  description: string = 'No description';
  partitionsCount: number = 10;
  topicConfigurations: TopicConfigurations = {};
  responseTimeoutSecond: number = 5;
  timeoutSecond: number = 30;
  timeoutStrategy: FailureStrategies = FailureStrategies.Failed;
  failureStrategy: FailureStrategies = FailureStrategies.Failed;
  inputParameters: {
    [key: string]: any;
  } = {};

  constructor(taskDefinition: ITaskDefinitionData) {
    const taskValidationErrors = taskValidation(taskDefinition);

    if (taskValidationErrors.length)
      throw new Error(taskValidationErrors.join('\n'));

    Object.assign(this, taskDefinition);
    this.topicConfigurations = Object.assign(
      defaultTopicConfigurations,
      taskDefinition.topicConfigurations,
    );
  }

  toObject = (): any => {
    return R.pick(
      [
        'name',
        'description',
        'partitionsCount',
        'topicConfigurations',
        'responseTimeoutSecond',
        'timeoutSecond',
        'timeoutStrategy',
        'failureStrategy',
        'retry',
        'recoveryWorkflow',
        'inputParameters',
      ],
      this,
    );
  };

  toJSON = (): string => {
    return JSON.stringify(this.toObject());
  };
}
