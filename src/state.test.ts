import * as State from './state';
import * as TaskC from './constants/task';

describe('State', () => {
  describe('Update task', () => {
    test('Ack task', () => {
      const scheduledTask = {
        taskName: 'MOCK_TASK',
        taskReferenceNames: 'MOCK_TASK',
        taskId: 'MOCK_TASK_001',
        workflowId: 'MOCK_WORKFLOW_001',
        status: TaskC.TaskStates.Scheduled,
        createTime: 123,
        startTime: 0,
        endTime: 0,
        input: {},
        output: null,
        logs: [],
        retryCount: 0,
      };
      expect(
        State.updateTask(scheduledTask, {
          status: TaskC.TaskStates.Inprogress,
          taskId: 'MOCK_TASK_001',
        }),
      ).toEqual({ ...scheduledTask, status: TaskC.TaskStates.Inprogress });
    });

    test('Complete task', () => {
      const scheduledTask = {
        taskName: 'MOCK_TASK',
        taskReferenceNames: 'MOCK_TASK',
        taskId: 'MOCK_TASK_001',
        workflowId: 'MOCK_WORKFLOW_001',
        status: TaskC.TaskStates.Inprogress,
        createTime: 123,
        startTime: 0,
        endTime: 0,
        input: {},
        output: null,
        logs: ['Job accepted'],
        retryCount: 0,
      };
      expect(
        State.updateTask(scheduledTask, {
          status: TaskC.TaskStates.Completed,
          taskId: 'MOCK_TASK_001',
          logs: 'Done!',
          output: {
            foo: 'bar',
          },
        }),
      ).toEqual({
        ...scheduledTask,
        status: TaskC.TaskStates.Completed,
        logs: ['Job accepted', 'Done!'],
        output: {
          foo: 'bar',
        },
      });
    });

    test('Invalid stored task', () => {
      expect(() =>
        State.updateTask(
          JSON.parse(
            JSON.stringify({
              taskName: 'MOCK_TASK',
              taskReferenceNames: 'MOCK_TASK',
              taskId: 'MOCK_TASK_001',
              workflowId: 'MOCK_WORKFLOW_001',
              status: 'INVALID_STATUS',
              createTime: 123,
              startTime: 0,
              endTime: 0,
              input: {},
              output: null,
              logs: [],
              retryCount: 0,
            }),
          ),
          {
            status: TaskC.TaskStates.Inprogress,
            taskId: 'MOCK_TASK_001',
            logs: '',
          },
        ),
      ).toThrow('Current status: "INVALID_STATUS" is invalid');
    });

    test('Invalid state changing', () => {
      expect(() =>
        State.updateTask(
          JSON.parse(
            JSON.stringify({
              taskName: 'MOCK_TASK',
              taskReferenceNames: 'MOCK_TASK',
              taskId: 'MOCK_TASK_001',
              workflowId: 'MOCK_WORKFLOW_001',
              status: TaskC.TaskStates.Failed,
              createTime: 123,
              startTime: 0,
              endTime: 0,
              input: {},
              output: null,
              logs: [],
              retryCount: 0,
            }),
          ),
          {
            status: TaskC.TaskStates.Completed,
            taskId: 'MOCK_TASK_001',
            logs: '',
          },
        ),
      ).toThrow('Cannot change status from FAILED to COMPLETED');
    });
  });
});
