import * as Task from './task';
import * as TaskC from './constants/task';

describe('Task', () => {
  describe('Create task', () => {
    test('Default value', () => {
      expect(new Task.TaskDefinition({ name: 'hello-world' })).toEqual({
        name: 'hello-world',
        description: 'No description',
        failureStrategy: 'FAILED',
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
        new Task.TaskDefinition({
          name: 'hello-world',
          failureStrategy: TaskC.FailureStrategies.Ignore,
        }),
      ).toEqual({
        name: 'hello-world',
        description: 'No description',
        failureStrategy: 'IGNORE',
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
        new Task.TaskDefinition({
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
          new Task.TaskDefinition({
            name: '',
            failureStrategy: TaskC.FailureStrategies.RecoveryWorkflow,
            topicConfigurations: {
              'cleanup.policy': 'delete',
            },
          }),
      ).toThrow('Name not valid');
    });

    test('failureStrategy to "RECOVERY_WORKFLOW" without recoveryWorkflow param', () => {
      expect(
        () =>
          new Task.TaskDefinition({
            name: 'hello-world',
            failureStrategy: TaskC.FailureStrategies.RecoveryWorkflow,
            topicConfigurations: {
              'cleanup.policy': 'delete',
            },
          }),
      ).toThrow('Need a recoveryWorkflow');
    });

    test('failureStrategy to "RECOVERY_WORKFLOW" with recoveryWorkflow param', () => {
      expect(
        new Task.TaskDefinition({
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
          new Task.TaskDefinition({
            name: 'hello-world',
            failureStrategy: TaskC.FailureStrategies.Retry,
            topicConfigurations: {
              'cleanup.policy': 'delete',
            },
          }),
      ).toThrow('Need a retry config');
    });

    test('failureStrategy to "RETRY" with retry param', () => {
      expect(
        new Task.TaskDefinition({
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
