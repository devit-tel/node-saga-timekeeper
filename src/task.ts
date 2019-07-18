import * as R from 'ramda';
import * as TaskC from './constants/task';

const defaultTopicConfigurations = {
  'cleanup.policy': 'compact',
  'compression.type': 'snappy',
  'delete.retention.ms': 86400000,
  'file.delete.delay.ms': 60000,
};

const isRecoveryWorkflowConfigValid = (
  taskDefinition: TaskC.TaskDefinition,
): boolean =>
  (taskDefinition.timeoutStrategy ===
    TaskC.FailureStrategies.RecoveryWorkflow ||
    taskDefinition.failureStrategy ===
      TaskC.FailureStrategies.RecoveryWorkflow) &&
  (R.isNil(R.path(['recoveryWorkflow', 'name'], taskDefinition)) ||
    R.isNil(R.path(['recoveryWorkflow', 'rev'], taskDefinition)));

const isFailureStrategiesConfigValid = (
  taskDefinition: TaskC.TaskDefinition,
): boolean =>
  (taskDefinition.timeoutStrategy === TaskC.FailureStrategies.Retry ||
    taskDefinition.failureStrategy === TaskC.FailureStrategies.Retry) &&
  (R.isNil(R.path(['retry', 'limit'], taskDefinition)) ||
    R.isNil(R.path(['retry', 'delaySecond'], taskDefinition)));

export class TaskDefinition implements TaskC.TaskDefinition {
  name: string;
  description: string = 'No description';
  partitionsCount: number = 10;
  topicConfigurations: TaskC.TopicConfigurations = {};
  responseTimeoutSecond: number = 5;
  timeoutSecond: number = 30;
  timeoutStrategy: TaskC.FailureStrategies = TaskC.FailureStrategies.Failed;
  failureStrategy: TaskC.FailureStrategies = TaskC.FailureStrategies.Failed;

  constructor(taskDefinition: TaskC.TaskDefinition) {
    if (isRecoveryWorkflowConfigValid(taskDefinition)) {
      throw new Error('Need a recoveryWorkflow');
    }

    if (isFailureStrategiesConfigValid(taskDefinition)) {
      throw new Error('Need a retry config');
    }

    Object.assign(this, taskDefinition);
    this.topicConfigurations = Object.assign(
      // this.topicConfigurations,
      defaultTopicConfigurations,
      taskDefinition.topicConfigurations,
    );
  }
}
