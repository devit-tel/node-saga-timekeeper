import * as TaskDefinition from './taskDefinition';
import * as TaskC from './constants/task';

jest.mock('uuid/v4');
Date.now = jest.fn();

describe('Task', () => {
  describe('Create TaskDefinition', () => {
    test('Default value', () => {
      expect(
        new TaskDefinition.TaskDefinition({ name: 'hello-world' }),
      ).toEqual({
        name: 'hello-world',
        description: 'No description',
        failureStrategy: 'FAILED',
        inputParameters: {},
        partitionsCount: 10,
        responseTimeoutSecond: 5,
        timeoutSecond: 30,
        timeoutStrategy: 'FAILED',
        topicConfigurations: {
          'cleanup.policy': 'compact',
          'compression.type': 'snappy',
          'delete.retention.ms': 86400000,
          'file.delete.delay.ms': 60000,
        },
      });
    });

    test('Overided default value', () => {
      expect(
        new TaskDefinition.TaskDefinition({
          name: 'hello-world',
          failureStrategy: TaskC.FailureStrategies.Ignore,
        }),
      ).toEqual({
        name: 'hello-world',
        description: 'No description',
        failureStrategy: 'IGNORE',
        inputParameters: {},
        partitionsCount: 10,
        responseTimeoutSecond: 5,
        timeoutSecond: 30,
        timeoutStrategy: 'FAILED',
        topicConfigurations: {
          'cleanup.policy': 'compact',
          'compression.type': 'snappy',
          'delete.retention.ms': 86400000,
          'file.delete.delay.ms': 60000,
        },
      });
    });

    test('set topicConfigurations', () => {
      expect(
        new TaskDefinition.TaskDefinition({
          name: 'hello-world',
          failureStrategy: TaskC.FailureStrategies.Ignore,
          topicConfigurations: {
            'cleanup.policy': 'delete',
          },
        }),
      ).toEqual({
        name: 'hello-world',
        description: 'No description',
        failureStrategy: 'IGNORE',
        inputParameters: {},
        partitionsCount: 10,
        responseTimeoutSecond: 5,
        timeoutSecond: 30,
        timeoutStrategy: 'FAILED',
        topicConfigurations: {
          'cleanup.policy': 'delete',
          'compression.type': 'snappy',
          'delete.retention.ms': 86400000,
          'file.delete.delay.ms': 60000,
        },
      });
    });

    test('failureStrategy to "RECOVERY_WORKFLOW" without recoveryWorkflow param', () => {
      expect(
        () =>
          new TaskDefinition.TaskDefinition({
            name: '',
            failureStrategy: TaskC.FailureStrategies.RecoveryWorkflow,
            topicConfigurations: {
              'cleanup.policy': 'delete',
            },
          }),
      ).toThrow('taskDefinition.name is invalid');
    });

    test('failureStrategy to "RECOVERY_WORKFLOW" without recoveryWorkflow param', () => {
      expect(
        () =>
          new TaskDefinition.TaskDefinition({
            name: 'hello-world',
            failureStrategy: TaskC.FailureStrategies.RecoveryWorkflow,
            topicConfigurations: {
              'cleanup.policy': 'delete',
            },
          }),
      ).toThrow('taskDefinition.recoveryWorkflow is invalid');
    });

    test('failureStrategy to "RECOVERY_WORKFLOW" with recoveryWorkflow param', () => {
      expect(
        new TaskDefinition.TaskDefinition({
          name: 'hello-world',
          failureStrategy: TaskC.FailureStrategies.RecoveryWorkflow,
          topicConfigurations: {
            'cleanup.policy': 'delete',
          },
          recoveryWorkflow: {
            name: 'huhu',
            rev: 3,
          },
        }),
      ).toEqual({
        description: 'No description',
        failureStrategy: 'RECOVERY_WORKFLOW',
        inputParameters: {},
        name: 'hello-world',
        partitionsCount: 10,
        recoveryWorkflow: {
          name: 'huhu',
          rev: 3,
        },
        responseTimeoutSecond: 5,
        timeoutSecond: 30,
        timeoutStrategy: 'FAILED',
        topicConfigurations: {
          'cleanup.policy': 'delete',
          'compression.type': 'snappy',
          'delete.retention.ms': 86400000,
          'file.delete.delay.ms': 60000,
        },
      });
    });

    test('failureStrategy to "RETRY" without retry param', () => {
      expect(
        () =>
          new TaskDefinition.TaskDefinition({
            name: 'hello-world',
            failureStrategy: TaskC.FailureStrategies.Retry,
            topicConfigurations: {
              'cleanup.policy': 'delete',
            },
          }),
      ).toThrow('taskDefinition.retry is invalid');
    });

    test('failureStrategy to "RETRY" with retry param', () => {
      expect(
        new TaskDefinition.TaskDefinition({
          name: 'hello-world',
          failureStrategy: TaskC.FailureStrategies.Retry,
          topicConfigurations: {
            'cleanup.policy': 'delete',
          },
          retry: {
            delaySecond: 1,
            limit: 3,
          },
        }),
      ).toEqual({
        description: 'No description',
        failureStrategy: 'RETRY',
        inputParameters: {},
        name: 'hello-world',
        partitionsCount: 10,
        responseTimeoutSecond: 5,
        retry: {
          delaySecond: 1,
          limit: 3,
        },
        timeoutSecond: 30,
        timeoutStrategy: 'FAILED',
        topicConfigurations: {
          'cleanup.policy': 'delete',
          'compression.type': 'snappy',
          'delete.retention.ms': 86400000,
          'file.delete.delay.ms': 60000,
        },
      });
    });
  });
});
