import * as Task from './task';

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
  });
});
