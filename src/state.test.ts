import * as State from './state';
import * as TaskC from './constants/task';
import * as WorkflowC from './constants/workflow';
// import MemoryStore from './stores/MemoryStore';

describe('State', () => {
  describe('Process task', () => {
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
        State.processTask(scheduledTask, {
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
        State.processTask(scheduledTask, {
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
        State.processTask(
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
        State.processTask(
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

  describe('findTaskPath', () => {
    test('Simple one', () => {
      expect(
        State.findTaskPath('eiei3', [
          {
            name: 'eiei',
            taskReferenceName: 'eiei',
            type: TaskC.TaskTypes.Task,
            inputParameters: {},
          },
          {
            name: 'eiei',
            taskReferenceName: 'eiei2',
            type: TaskC.TaskTypes.Task,
            inputParameters: {},
          },
          {
            name: 'eiei',
            taskReferenceName: 'eiei3',
            type: TaskC.TaskTypes.Task,
            inputParameters: {},
          },
          {
            name: 'eiei',
            taskReferenceName: 'eiei4',
            type: TaskC.TaskTypes.Task,
            inputParameters: {},
          },
        ]),
      ).toEqual([2]);
    });

    test('With Parallel tasks', () => {
      expect(
        State.findTaskPath('parallel12_child1', [
          {
            name: 'eiei',
            taskReferenceName: 'eiei',
            type: TaskC.TaskTypes.Task,
            inputParameters: {},
          },
          {
            name: 'eiei',
            taskReferenceName: 'PARALLEL_TASK',
            type: TaskC.TaskTypes.Parallel,
            inputParameters: {},
            parallelTasks: [
              [
                {
                  name: 'eiei',
                  taskReferenceName: 'parallel1_child2',
                  type: TaskC.TaskTypes.Parallel,
                  inputParameters: {},
                  parallelTasks: [
                    [
                      {
                        name: 'eiei',
                        taskReferenceName: 'parallel12_child1',
                        type: TaskC.TaskTypes.Task,
                        inputParameters: {},
                      },
                      {
                        name: 'eiei',
                        taskReferenceName: 'parallel12_child2',
                        type: TaskC.TaskTypes.Task,
                        inputParameters: {},
                      },
                    ],
                    [
                      {
                        name: 'eiei',
                        taskReferenceName: 'parallel11_child1',
                        type: TaskC.TaskTypes.Task,
                        inputParameters: {},
                      },
                    ],
                  ],
                },
                {
                  name: 'eiei',
                  taskReferenceName: 'parallel1_child1',
                  type: TaskC.TaskTypes.Task,
                  inputParameters: {},
                },
              ],
              [
                {
                  name: 'eiei',
                  taskReferenceName: 'parallel2_child1',
                  type: TaskC.TaskTypes.Task,
                  inputParameters: {},
                },
                {
                  name: 'eiei',
                  taskReferenceName: 'parallel2_child2',
                  type: TaskC.TaskTypes.Task,
                  inputParameters: {},
                },
              ],
            ],
          },
          {
            name: 'eiei',
            taskReferenceName: 'eiei4',
            type: TaskC.TaskTypes.Task,
            inputParameters: {},
          },
        ]),
      ).toEqual([1, 'parallelTasks', 0, 0, 'parallelTasks', 0, 0]);
    });

    test('With Parallel tasks 2', () => {
      expect(
        State.findTaskPath('parallel1_child1', [
          {
            name: 'eiei',
            taskReferenceName: 'eiei',
            type: TaskC.TaskTypes.Task,
            inputParameters: {},
          },
          {
            name: 'eiei',
            taskReferenceName: 'PARALLEL_TASK',
            type: TaskC.TaskTypes.Parallel,
            inputParameters: {},
            parallelTasks: [
              [
                {
                  name: 'eiei',
                  taskReferenceName: 'parallel1_child2',
                  type: TaskC.TaskTypes.Parallel,
                  inputParameters: {},
                  parallelTasks: [
                    [
                      {
                        name: 'eiei',
                        taskReferenceName: 'parallel12_child1',
                        type: TaskC.TaskTypes.Task,
                        inputParameters: {},
                      },
                      {
                        name: 'eiei',
                        taskReferenceName: 'parallel12_child2',
                        type: TaskC.TaskTypes.Task,
                        inputParameters: {},
                      },
                    ],
                    [
                      {
                        name: 'eiei',
                        taskReferenceName: 'parallel11_child1',
                        type: TaskC.TaskTypes.Task,
                        inputParameters: {},
                      },
                    ],
                  ],
                },
                {
                  name: 'eiei',
                  taskReferenceName: 'parallel1_child1',
                  type: TaskC.TaskTypes.Task,
                  inputParameters: {},
                },
              ],
              [
                {
                  name: 'eiei',
                  taskReferenceName: 'parallel2_child1',
                  type: TaskC.TaskTypes.Task,
                  inputParameters: {},
                },
                {
                  name: 'eiei',
                  taskReferenceName: 'parallel2_child2',
                  type: TaskC.TaskTypes.Task,
                  inputParameters: {},
                },
              ],
            ],
          },
          {
            name: 'eiei',
            taskReferenceName: 'eiei4',
            type: TaskC.TaskTypes.Task,
            inputParameters: {},
          },
        ]),
      ).toEqual([1, 'parallelTasks', 0, 1]);
    });

    // tslint:disable-next-line: max-func-body-length
    test('With Decisions tasks', () => {
      const tasks: WorkflowC.AllTaskType[] = [
        {
          name: 'eiei',
          taskReferenceName: 'eiei',
          type: TaskC.TaskTypes.Task,
          inputParameters: {},
        },
        {
          name: 'task002',
          taskReferenceName: 'decision_task_1',
          type: TaskC.TaskTypes.Decision,
          inputParameters: {},
          defaultDecision: [
            {
              name: 'decision_task_1_default',
              taskReferenceName: 'default_one',
              type: TaskC.TaskTypes.Task,
              inputParameters: {},
            },
          ],
          decisions: {
            case1: [
              {
                name: 'huhu',
                taskReferenceName: 'decision_task_1_case1',
                type: TaskC.TaskTypes.Decision,
                inputParameters: {},
                defaultDecision: [
                  {
                    name: 'eiei',
                    taskReferenceName: 'decision_task_1_case1_default',
                    type: TaskC.TaskTypes.Task,
                    inputParameters: {},
                  },
                ],
                decisions: {
                  caseA: [
                    {
                      name: 'eiei',
                      taskReferenceName: 'eiei5',
                      type: TaskC.TaskTypes.Task,
                      inputParameters: {},
                    },
                    {
                      name: 'eiei',
                      taskReferenceName: 'eiei55',
                      type: TaskC.TaskTypes.Task,
                      inputParameters: {},
                    },
                  ],
                  caseB: [
                    {
                      name: 'eiei',
                      taskReferenceName: 'eiei6',
                      type: TaskC.TaskTypes.Task,
                      inputParameters: {},
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          name: 'eiei',
          taskReferenceName: 'eiei4',
          type: TaskC.TaskTypes.Task,
          inputParameters: {},
        },
      ];
      expect(State.findTaskPath('decision_task_1_case1', tasks)).toEqual([
        1,
        'decisions',
        'case1',
        0,
      ]);

      expect(
        State.findTaskPath('decision_task_1_case1_default', tasks),
      ).toEqual([1, 'decisions', 'case1', 0, 'defaultDecision', 0]);

      expect(State.findTaskPath('eiei5', tasks)).toEqual([
        1,
        'decisions',
        'case1',
        0,
        'decisions',
        'caseA',
        0,
      ]);

      expect(State.findTaskPath('eiei55', tasks)).toEqual([
        1,
        'decisions',
        'case1',
        0,
        'decisions',
        'caseA',
        1,
      ]);

      expect(State.findTaskPath('eiei6', tasks)).toEqual([
        1,
        'decisions',
        'case1',
        0,
        'decisions',
        'caseB',
        0,
      ]);
    });

    // tslint:disable-next-line: max-func-body-length
    test('With Complex tasks', () => {
      const tasks: WorkflowC.AllTaskType[] = [
        {
          name: 'eiei',
          taskReferenceName: 'eiei',
          type: TaskC.TaskTypes.Task,
          inputParameters: {},
        },
        {
          name: 'task002',
          taskReferenceName: 'decision_task_1',
          type: TaskC.TaskTypes.Decision,
          inputParameters: {},
          defaultDecision: [
            {
              name: 'decision_task_1_default',
              taskReferenceName: 'default_one',
              type: TaskC.TaskTypes.Task,
              inputParameters: {},
            },
          ],
          decisions: {
            case1: [
              {
                name: 'eiei',
                taskReferenceName: 'decision_task_1_case1',
                type: TaskC.TaskTypes.Parallel,
                inputParameters: {},
                parallelTasks: [
                  [
                    {
                      name: 'eiei',
                      taskReferenceName: 'decision_task_1_case1_parallel1_1',
                      type: TaskC.TaskTypes.Task,
                      inputParameters: {},
                    },
                    {
                      name: 'eiei',
                      taskReferenceName: 'decision_task_1_case1_parallel1_2',
                      type: TaskC.TaskTypes.Task,
                      inputParameters: {},
                    },
                  ],
                  [
                    {
                      name: 'eiei',
                      taskReferenceName: 'decision_task_1_case1_parallel2_1',
                      type: TaskC.TaskTypes.Task,
                      inputParameters: {},
                    },
                  ],
                ],
              },
            ],
            case2: [
              {
                name: 'eiei',
                taskReferenceName: 'decision_task_1_case2_1',
                type: TaskC.TaskTypes.Task,
                inputParameters: {},
              },
              {
                name: 'eiei',
                taskReferenceName: 'decision_task_1_case2_2',
                type: TaskC.TaskTypes.Task,
                inputParameters: {},
              },
            ],
            case3: [
              {
                name: 'huhu',
                taskReferenceName: 'decision_task_1_case3',
                type: TaskC.TaskTypes.Decision,
                inputParameters: {},
                defaultDecision: [
                  {
                    name: 'eiei',
                    taskReferenceName: 'decision_task_1_case3_default',
                    type: TaskC.TaskTypes.Task,
                    inputParameters: {},
                  },
                ],
                decisions: {
                  caseA: [
                    {
                      name: 'eiei',
                      taskReferenceName: 'decision_task_1_case3_caseA_1',
                      type: TaskC.TaskTypes.Task,
                      inputParameters: {},
                    },
                    {
                      name: 'eiei',
                      taskReferenceName: 'decision_task_1_case3_caseA_2',
                      type: TaskC.TaskTypes.Task,
                      inputParameters: {},
                    },
                  ],
                  caseB: [
                    {
                      name: 'eiei',
                      taskReferenceName: 'decision_task_1_case3_caseB_1',
                      type: TaskC.TaskTypes.Task,
                      inputParameters: {},
                    },
                  ],
                },
              },
              {
                name: 'huhu',
                taskReferenceName: 'decision_task_1_case3_2',
                type: TaskC.TaskTypes.Decision,
                inputParameters: {},
                defaultDecision: [
                  {
                    name: 'eiei',
                    taskReferenceName: 'decision_task_1_case3_2_default',
                    type: TaskC.TaskTypes.Task,
                    inputParameters: {},
                  },
                ],
                decisions: {
                  caseA: [
                    {
                      name: 'eiei',
                      taskReferenceName: 'decision_task_1_case3_2_caseA_1',
                      type: TaskC.TaskTypes.Task,
                      inputParameters: {},
                    },
                    {
                      name: 'eiei',
                      taskReferenceName: 'decision_task_1_case3_2_caseA_2',
                      type: TaskC.TaskTypes.Task,
                      inputParameters: {},
                    },
                  ],
                  caseB: [
                    {
                      name: 'eiei',
                      taskReferenceName: 'decision_task_1_case3_2_caseB_1',
                      type: TaskC.TaskTypes.Task,
                      inputParameters: {},
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          name: 'eiei',
          taskReferenceName: 'some_SubWorkflow',
          type: TaskC.TaskTypes.SubWorkflow,
          inputParameters: {},
          workflow: {
            name: 'lol',
            rev: 5,
          },
        },
      ];
      expect(
        State.findTaskPath('decision_task_1_case3_caseB_1', tasks),
      ).toEqual([1, 'decisions', 'case3', 0, 'decisions', 'caseB', 0]);

      expect(
        State.findTaskPath('decision_task_1_case3_2_caseB_1', tasks),
      ).toEqual([1, 'decisions', 'case3', 1, 'decisions', 'caseB', 0]);

      expect(State.findTaskPath('some_SubWorkflow', tasks)).toEqual([2]);
    });
  });

  describe('walkFornextTask', () => {
    // tslint:disable-next-line: max-func-body-length
    test('test1', () => {
      const tasks: WorkflowC.AllTaskType[] = [
        {
          name: 'eiei',
          taskReferenceName: 'eiei',
          type: TaskC.TaskTypes.Task,
          inputParameters: {},
        },
        {
          name: 'task002',
          taskReferenceName: 'decision_task_1',
          type: TaskC.TaskTypes.Decision,
          inputParameters: {},
          defaultDecision: [
            {
              name: 'decision_task_1_default',
              taskReferenceName: 'default_one',
              type: TaskC.TaskTypes.Task,
              inputParameters: {},
            },
          ],
          decisions: {
            case1: [
              {
                name: 'huhu',
                taskReferenceName: 'decision_task_1_case1',
                type: TaskC.TaskTypes.Decision,
                inputParameters: {},
                defaultDecision: [
                  {
                    name: 'eiei',
                    taskReferenceName: 'decision_task_1_case1_default',
                    type: TaskC.TaskTypes.Task,
                    inputParameters: {},
                  },
                ],
                decisions: {
                  caseA: [
                    {
                      name: 'eiei',
                      taskReferenceName: 'eiei5',
                      type: TaskC.TaskTypes.Task,
                      inputParameters: {},
                    },
                    {
                      name: 'eiei',
                      taskReferenceName: 'eiei55',
                      type: TaskC.TaskTypes.Task,
                      inputParameters: {},
                    },
                  ],
                  caseB: [
                    {
                      name: 'eiei',
                      taskReferenceName: 'eiei6',
                      type: TaskC.TaskTypes.Task,
                      inputParameters: {},
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          name: 'eiei',
          taskReferenceName: 'eiei4',
          type: TaskC.TaskTypes.Task,
          inputParameters: {},
        },
      ];

      expect(State.walkForNextTasks(tasks, [1])).toEqual([
        {
          name: 'decision_task_1_default',
          taskReferenceName: 'default_one',
          type: TaskC.TaskTypes.Task,
          inputParameters: {},
        },
      ]);

      // Completed workflow
      expect(State.walkForNextTasks(tasks, [2])).toEqual(null);

      expect(
        State.walkForNextTasks(tasks, [1, 'decisions', 'case1', 0]),
      ).toEqual([
        {
          name: 'eiei',
          taskReferenceName: 'decision_task_1_case1_default',
          type: TaskC.TaskTypes.Task,
          inputParameters: {},
        },
      ]);

      expect(
        State.walkForNextTasks(tasks, [
          1,
          'decisions',
          'case1',
          0,
          'decisions',
          'caseA',
          0,
        ]),
      ).toEqual([
        {
          name: 'eiei',
          taskReferenceName: 'eiei55',
          type: TaskC.TaskTypes.Task,
          inputParameters: {},
        },
      ]);

      expect(
        State.walkForNextTasks(tasks, [
          1,
          'decisions',
          'case1',
          0,
          'decisions',
          'caseA',
          1,
        ]),
      ).toEqual([
        {
          name: 'eiei',
          taskReferenceName: 'eiei4',
          type: TaskC.TaskTypes.Task,
          inputParameters: {},
        },
      ]);
    });
  });
});
