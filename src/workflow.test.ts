import * as Workflow from './workflow';
import * as TaskC from './constants/task';

jest.mock('uuid/v4');
Date.now = jest.fn();

describe('Workflow', () => {
  describe('Workflow', () => {
    const simpleWorkflow = new Workflow.Workflow(
      {
        name: 'WORKFLOW_001',
        rev: 1,
        tasks: [
          {
            name: 'TASK_1',
            taskReferenceName: 'TASK_1',
            type: TaskC.TaskTypes.Task,
            inputParameters: {},
          },
          {
            name: 'TASK_2',
            taskReferenceName: 'TASK_2',
            type: TaskC.TaskTypes.Task,
            inputParameters: {},
          },
        ],
      },
      {},
      {},
    );

    test('Simple Workflow', () => {
      expect(simpleWorkflow).toEqual({
        createTime: undefined,
        endTime: null,
        input: {},
        retryCount: 0,
        startTime: undefined,
        status: 'RUNNING',
        taskData: {},
        workflowDefinition: {
          name: 'WORKFLOW_001',
          rev: 1,
          tasks: [
            {
              name: 'TASK_1',
              taskReferenceName: 'TASK_1',
              type: TaskC.TaskTypes.Task,
              inputParameters: {},
            },
            {
              name: 'TASK_2',
              taskReferenceName: 'TASK_2',
              type: TaskC.TaskTypes.Task,
              inputParameters: {},
            },
          ],
        },
        workflowId: undefined,
        workflowName: 'WORKFLOW_001',
        workflowRev: 1,
      });
    });

    test('Start first task', () => {
      expect(async () => await simpleWorkflow.startNextTask()).not.toThrow();
    });
  });
});
