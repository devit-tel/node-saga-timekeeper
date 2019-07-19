import * as Workflow from './workflow';
import * as TaskC from './constants/task';
import * as WorkflowC from './constants/workflow';

describe('Workflow', () => {
  describe('Create workflow', () => {
    test('Default value', () => {
      expect(
        new Workflow.WorkflowDefinition({
          name: 'hello-world',
          rev: 1,
          tasks: [
            {
              name: 'huhu',
              taskReferenceName: 'HUHU',
              type: TaskC.TaskTypes.SubWorkflow,
              inputParameters: {
                a: 'b',
              },
              workflow: {
                name: 'a',
                rev: 1,
              },
            },
          ],
        }),
      ).toEqual({
        name: 'hello-world',
        rev: 1,
        description: 'No description',
        tasks: [
          {
            inputParameters: {
              a: 'b',
            },
            name: 'huhu',
            taskReferenceName: 'HUHU',
            type: 'SUB_WORKFLOW',
            workflow: {
              name: 'a',
              rev: 1,
            },
          },
        ],
      });
    });

    test('Invalid name', () => {
      expect(
        () =>
          new Workflow.WorkflowDefinition({
            name: '',
            rev: 1,
            tasks: [
              {
                name: 'huhu',
                taskReferenceName: 'HUHU',
                type: TaskC.TaskTypes.Task,
                inputParameters: {
                  a: 'b',
                },
              },
            ],
          }),
      ).toThrow('Name not valid');
    });

    test('Invalid rev', () => {
      expect(
        () =>
          new Workflow.WorkflowDefinition({
            name: 'hello-world',
            rev: undefined,
            tasks: [
              {
                name: 'huhu',
                taskReferenceName: 'HUHU',
                type: TaskC.TaskTypes.Task,
                inputParameters: {
                  a: 'b',
                },
              },
            ],
          }),
      ).toThrow('Rev not valid');
    });

    test('failureStrategy to "RECOVERY_WORKFLOW" without recoveryWorkflow param', () => {
      expect(
        () =>
          new Workflow.WorkflowDefinition({
            name: 'hello-world',
            rev: 1,
            tasks: [
              {
                name: 'huhu',
                taskReferenceName: 'HUHU',
                type: TaskC.TaskTypes.SubWorkflow,
                inputParameters: {
                  a: 'b',
                },
                workflow: {
                  name: 'a',
                  rev: 1,
                },
              },
            ],
            failureStrategy: WorkflowC.FailureStrategies.RecoveryWorkflow,
          }),
      ).toThrow('Need a recoveryWorkflow');
    });

    test('failureStrategy to "RECOVERY_WORKFLOW" with recoveryWorkflow param', () => {
      expect(
        new Workflow.WorkflowDefinition({
          name: 'hello-world',
          rev: 1,
          tasks: [
            {
              name: 'huhu',
              taskReferenceName: 'HUHU',
              type: TaskC.TaskTypes.SubWorkflow,
              inputParameters: {
                a: 'b',
              },
              workflow: {
                name: 'a',
                rev: 1,
              },
            },
          ],
          failureStrategy: WorkflowC.FailureStrategies.RecoveryWorkflow,
          recoveryWorkflow: {
            name: 'hihi',
            rev: 2,
          },
        }),
      ).toEqual({
        description: 'No description',
        failureStrategy: 'RECOVERY_WORKFLOW',
        name: 'hello-world',
        recoveryWorkflow: {
          name: 'hihi',
          rev: 2,
        },
        rev: 1,
        tasks: [
          {
            inputParameters: {
              a: 'b',
            },
            name: 'huhu',
            taskReferenceName: 'HUHU',
            type: 'SUB_WORKFLOW',
            workflow: {
              name: 'a',
              rev: 1,
            },
          },
        ],
      });
    });

    test('failureStrategy to "RETRY" without retry param', () => {
      expect(
        () =>
          new Workflow.WorkflowDefinition({
            name: 'hello-world',
            rev: 1,
            tasks: [
              {
                name: 'huhu',
                taskReferenceName: 'HUHU',
                type: TaskC.TaskTypes.SubWorkflow,
                inputParameters: {
                  a: 'b',
                },
                workflow: {
                  name: 'a',
                  rev: 1,
                },
              },
            ],
            failureStrategy: WorkflowC.FailureStrategies.Retry,
          }),
      ).toThrow('Need a retry config');
    });

    test('failureStrategy to "RETRY" with retry param', () => {
      expect(
        new Workflow.WorkflowDefinition({
          name: 'hello-world',
          rev: 1,
          tasks: [
            {
              name: 'huhu',
              taskReferenceName: 'HUHU',
              type: TaskC.TaskTypes.SubWorkflow,
              inputParameters: {
                a: 'b',
              },
              workflow: {
                name: 'a',
                rev: 1,
              },
            },
          ],
          failureStrategy: WorkflowC.FailureStrategies.Retry,
          retry: {
            delaySecond: 3,
            limit: 2,
          },
        }),
      ).toEqual({
        description: 'No description',
        failureStrategy: 'RETRY',
        name: 'hello-world',
        rev: 1,
        tasks: [
          {
            type: 'SUB_WORKFLOW',
            inputParameters: {
              a: 'b',
            },
            name: 'huhu',
            taskReferenceName: 'HUHU',
            workflow: {
              name: 'a',
              rev: 1,
            },
          },
        ],
        retry: {
          delaySecond: 3,
          limit: 2,
        },
      });
    });

    test('Empty task', () => {
      expect(
        () =>
          new Workflow.WorkflowDefinition({
            name: 'hello-world',
            rev: 1,
            tasks: [],
          }),
      ).toThrow('Task cannot be empty');
    });
  });
});
