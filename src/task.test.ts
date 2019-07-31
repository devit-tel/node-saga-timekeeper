import * as Task from './task';
import * as TaskC from './constants/task';

jest.mock('uuid/v4');
Date.now = jest.fn();

describe('Task', () => {
  describe('Create Task instance', () => {
    test('Task', () => {
      expect(
        new Task.Task(
          'some_id',
          {
            name: 'task_name',
            type: TaskC.TaskTypes.Task,
            taskReferenceName: 'task_name_1',
            inputParameters: {},
          },
          {},
        ),
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
        taskReferenceNames: 'task_name_1',
        workflowId: 'some_id',
      });
    });

    test('Task', () => {
      expect(
        new Task.Task(
          'some_id',
          {
            name: 'task_name',
            type: TaskC.TaskTypes.Decision,
            taskReferenceName: 'task_name_1',
            inputParameters: {},
            defaultDecision: [
              {
                name: 'task_name',
                type: TaskC.TaskTypes.Task,
                taskReferenceName: 'task_defaultDecision_0',
                inputParameters: {},
              },
            ],
            decisions: {
              case1: [
                {
                  name: 'task_name',
                  type: TaskC.TaskTypes.Task,
                  taskReferenceName: 'task_case1_0',
                  inputParameters: {},
                },
                {
                  name: 'task_name',
                  type: TaskC.TaskTypes.Task,
                  taskReferenceName: 'task_case1_1',
                  inputParameters: {},
                },
              ],
            },
          },
          {},
        ),
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
        taskReferenceNames: 'task_name_1',
        workflowId: 'some_id',
      });
    });
  });
});
