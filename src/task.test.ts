import { TaskFromWorkflow } from './task';
import { TaskTypes } from './constants/task';

jest.mock('uuid/v4');
Date.now = jest.fn();

describe('Task', () => {
  describe('Create Task instance', () => {
    test('Task', () => {
      expect(
        new TaskFromWorkflow(
          'some_id',
          {
            name: 'task_name',
            type: TaskTypes.Task,
            taskReferenceName: 'task_name_1',
            inputParameters: {},
          },
          {},
        ).toObject(),
      ).toEqual({
        createTime: undefined,
        endTime: null,
        input: {},
        logs: [],
        output: {},
        retryCount: 0,
        startTime: null,
        status: 'SCHEDULED',
        taskId: undefined,
        taskName: 'task_name',
        taskReferenceName: 'task_name_1',
        type: 'TASK',
        workflowId: 'some_id',
      });
    });

    test('Task', () => {
      expect(
        new TaskFromWorkflow(
          'some_id',
          {
            name: 'task_name',
            type: TaskTypes.Decision,
            taskReferenceName: 'task_name_1',
            inputParameters: {},
            defaultDecision: [
              {
                name: 'task_name',
                type: TaskTypes.Task,
                taskReferenceName: 'task_defaultDecision_0',
                inputParameters: {},
              },
            ],
            decisions: {
              case1: [
                {
                  name: 'task_name',
                  type: TaskTypes.Task,
                  taskReferenceName: 'task_case1_0',
                  inputParameters: {},
                },
                {
                  name: 'task_name',
                  type: TaskTypes.Task,
                  taskReferenceName: 'task_case1_1',
                  inputParameters: {},
                },
              ],
            },
          },
          {},
        ).toObject(),
      ).toEqual({
        createTime: undefined,
        decisions: {
          case1: [
            {
              inputParameters: {},
              name: 'task_name',
              taskReferenceName: 'task_case1_0',
              type: 'TASK',
            },
            {
              inputParameters: {},
              name: 'task_name',
              taskReferenceName: 'task_case1_1',
              type: 'TASK',
            },
          ],
        },
        defaultDecision: [
          {
            inputParameters: {},
            name: 'task_name',
            taskReferenceName: 'task_defaultDecision_0',
            type: 'TASK',
          },
        ],
        endTime: null,
        input: {},
        logs: [],
        output: {},
        retryCount: 0,
        startTime: null,
        status: 'SCHEDULED',
        taskId: undefined,
        taskName: 'task_name',
        taskReferenceName: 'task_name_1',
        type: 'DECISION',
        workflowId: 'some_id',
      });
    });
  });
});
