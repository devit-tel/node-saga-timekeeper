import ramda from 'ramda';
import * as TaskC from './constants/task';

const defaultTopicConfigurations = {
  'cleanup.policy': 'compact',
  'compression.type': 'snappy',
  'delete.retention.ms': 86400000,
  'file.delete.delay.ms': 60000,
};

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
    if (
      (taskDefinition.timeoutStrategy ===
        TaskC.FailureStrategies.RecoveryWorkflow ||
        taskDefinition.failureStrategy ===
          TaskC.FailureStrategies.RecoveryWorkflow) &&
      ramda.isEmpty(ramda.path(['recoveryWorkflow', 'name'], taskDefinition)) &&
      ramda.isEmpty(ramda.path(['recoveryWorkflow', 'ref'], taskDefinition))
    ) {
      throw new Error('Need a recoveryWorkflow');
    }

    if (
      (taskDefinition.timeoutStrategy === TaskC.FailureStrategies.Retry ||
        taskDefinition.failureStrategy === TaskC.FailureStrategies.Retry) &&
      ramda.isEmpty(ramda.path(['retry', 'limit'], taskDefinition)) &&
      ramda.isEmpty(ramda.path(['retry', 'delaySecond'], taskDefinition))
    ) {
      throw new Error('Need a retry config');
    }

    Object.assign(this, taskDefinition);
    Object.assign(
      this.topicConfigurations,
      defaultTopicConfigurations,
      taskDefinition.topicConfigurations,
    );

    return this;
  }
}
