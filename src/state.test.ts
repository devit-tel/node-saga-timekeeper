import * as State from './state';
import { TaskStates, TaskTypes } from './constants/task';
import { WorkflowDefinition, AllTaskType } from './workflowDefinition';
// import MemoryStore from './stores/MemoryStore';

describe('State', () => {
  describe('findTaskPath', () => {
    test('Simple one', () => {
      expect(
        State.findTaskPath('eiei3', [
          {
            name: 'eiei',
            taskReferenceName: 'eiei',
            type: TaskTypes.Task,
            inputParameters: {},
          },
          {
            name: 'eiei',
            taskReferenceName: 'eiei2',
            type: TaskTypes.Task,
            inputParameters: {},
          },
          {
            name: 'eiei',
            taskReferenceName: 'eiei3',
            type: TaskTypes.Task,
            inputParameters: {},
          },
          {
            name: 'eiei',
            taskReferenceName: 'eiei4',
            type: TaskTypes.Task,
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
            type: TaskTypes.Task,
            inputParameters: {},
          },
          {
            name: 'eiei',
            taskReferenceName: 'PARALLEL_TASK',
            type: TaskTypes.Parallel,
            inputParameters: {},
            parallelTasks: [
              [
                {
                  name: 'eiei',
                  taskReferenceName: 'parallel1_child2',
                  type: TaskTypes.Parallel,
                  inputParameters: {},
                  parallelTasks: [
                    [
                      {
                        name: 'eiei',
                        taskReferenceName: 'parallel12_child1',
                        type: TaskTypes.Task,
                        inputParameters: {},
                      },
                      {
                        name: 'eiei',
                        taskReferenceName: 'parallel12_child2',
                        type: TaskTypes.Task,
                        inputParameters: {},
                      },
                    ],
                    [
                      {
                        name: 'eiei',
                        taskReferenceName: 'parallel11_child1',
                        type: TaskTypes.Task,
                        inputParameters: {},
                      },
                    ],
                  ],
                },
                {
                  name: 'eiei',
                  taskReferenceName: 'parallel1_child1',
                  type: TaskTypes.Task,
                  inputParameters: {},
                },
              ],
              [
                {
                  name: 'eiei',
                  taskReferenceName: 'parallel2_child1',
                  type: TaskTypes.Task,
                  inputParameters: {},
                },
                {
                  name: 'eiei',
                  taskReferenceName: 'parallel2_child2',
                  type: TaskTypes.Task,
                  inputParameters: {},
                },
              ],
            ],
          },
          {
            name: 'eiei',
            taskReferenceName: 'eiei4',
            type: TaskTypes.Task,
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
            type: TaskTypes.Task,
            inputParameters: {},
          },
          {
            name: 'eiei',
            taskReferenceName: 'PARALLEL_TASK',
            type: TaskTypes.Parallel,
            inputParameters: {},
            parallelTasks: [
              [
                {
                  name: 'eiei',
                  taskReferenceName: 'parallel1_child2',
                  type: TaskTypes.Parallel,
                  inputParameters: {},
                  parallelTasks: [
                    [
                      {
                        name: 'eiei',
                        taskReferenceName: 'parallel12_child1',
                        type: TaskTypes.Task,
                        inputParameters: {},
                      },
                      {
                        name: 'eiei',
                        taskReferenceName: 'parallel12_child2',
                        type: TaskTypes.Task,
                        inputParameters: {},
                      },
                    ],
                    [
                      {
                        name: 'eiei',
                        taskReferenceName: 'parallel11_child1',
                        type: TaskTypes.Task,
                        inputParameters: {},
                      },
                    ],
                  ],
                },
                {
                  name: 'eiei',
                  taskReferenceName: 'parallel1_child1',
                  type: TaskTypes.Task,
                  inputParameters: {},
                },
              ],
              [
                {
                  name: 'eiei',
                  taskReferenceName: 'parallel2_child1',
                  type: TaskTypes.Task,
                  inputParameters: {},
                },
                {
                  name: 'eiei',
                  taskReferenceName: 'parallel2_child2',
                  type: TaskTypes.Task,
                  inputParameters: {},
                },
              ],
            ],
          },
          {
            name: 'eiei',
            taskReferenceName: 'eiei4',
            type: TaskTypes.Task,
            inputParameters: {},
          },
        ]),
      ).toEqual([1, 'parallelTasks', 0, 1]);
    });

    // tslint:disable-next-line: max-func-body-length
    test('With Decisions tasks', () => {
      const tasks: AllTaskType[] = [
        {
          name: 'eiei',
          taskReferenceName: 'eiei',
          type: TaskTypes.Task,
          inputParameters: {},
        },
        {
          name: 'task002',
          taskReferenceName: 'decision_task_1',
          type: TaskTypes.Decision,
          inputParameters: {},
          defaultDecision: [
            {
              name: 'decision_task_1_default',
              taskReferenceName: 'default_one',
              type: TaskTypes.Task,
              inputParameters: {},
            },
          ],
          decisions: {
            case1: [
              {
                name: 'huhu',
                taskReferenceName: 'decision_task_1_case1',
                type: TaskTypes.Decision,
                inputParameters: {},
                defaultDecision: [
                  {
                    name: 'eiei',
                    taskReferenceName: 'decision_task_1_case1_default',
                    type: TaskTypes.Task,
                    inputParameters: {},
                  },
                ],
                decisions: {
                  caseA: [
                    {
                      name: 'eiei',
                      taskReferenceName: 'eiei5',
                      type: TaskTypes.Task,
                      inputParameters: {},
                    },
                    {
                      name: 'eiei',
                      taskReferenceName: 'eiei55',
                      type: TaskTypes.Task,
                      inputParameters: {},
                    },
                  ],
                  caseB: [
                    {
                      name: 'eiei',
                      taskReferenceName: 'eiei6',
                      type: TaskTypes.Task,
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
          type: TaskTypes.Task,
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
      const tasks: AllTaskType[] = [
        {
          name: 'eiei',
          taskReferenceName: 'eiei',
          type: TaskTypes.Task,
          inputParameters: {},
        },
        {
          name: 'task002',
          taskReferenceName: 'decision_task_1',
          type: TaskTypes.Decision,
          inputParameters: {},
          defaultDecision: [
            {
              name: 'decision_task_1_default',
              taskReferenceName: 'default_one',
              type: TaskTypes.Task,
              inputParameters: {},
            },
          ],
          decisions: {
            case1: [
              {
                name: 'eiei',
                taskReferenceName: 'decision_task_1_case1',
                type: TaskTypes.Parallel,
                inputParameters: {},
                parallelTasks: [
                  [
                    {
                      name: 'eiei',
                      taskReferenceName: 'decision_task_1_case1_parallel1_1',
                      type: TaskTypes.Task,
                      inputParameters: {},
                    },
                    {
                      name: 'eiei',
                      taskReferenceName: 'decision_task_1_case1_parallel1_2',
                      type: TaskTypes.Task,
                      inputParameters: {},
                    },
                  ],
                  [
                    {
                      name: 'eiei',
                      taskReferenceName: 'decision_task_1_case1_parallel2_1',
                      type: TaskTypes.Task,
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
                type: TaskTypes.Task,
                inputParameters: {},
              },
              {
                name: 'eiei',
                taskReferenceName: 'decision_task_1_case2_2',
                type: TaskTypes.Task,
                inputParameters: {},
              },
            ],
            case3: [
              {
                name: 'huhu',
                taskReferenceName: 'decision_task_1_case3',
                type: TaskTypes.Decision,
                inputParameters: {},
                defaultDecision: [
                  {
                    name: 'eiei',
                    taskReferenceName: 'decision_task_1_case3_default',
                    type: TaskTypes.Task,
                    inputParameters: {},
                  },
                ],
                decisions: {
                  caseA: [
                    {
                      name: 'eiei',
                      taskReferenceName: 'decision_task_1_case3_caseA_1',
                      type: TaskTypes.Task,
                      inputParameters: {},
                    },
                    {
                      name: 'eiei',
                      taskReferenceName: 'decision_task_1_case3_caseA_2',
                      type: TaskTypes.Task,
                      inputParameters: {},
                    },
                  ],
                  caseB: [
                    {
                      name: 'eiei',
                      taskReferenceName: 'decision_task_1_case3_caseB_1',
                      type: TaskTypes.Task,
                      inputParameters: {},
                    },
                  ],
                },
              },
              {
                name: 'huhu',
                taskReferenceName: 'decision_task_1_case3_2',
                type: TaskTypes.Decision,
                inputParameters: {},
                defaultDecision: [
                  {
                    name: 'eiei',
                    taskReferenceName: 'decision_task_1_case3_2_default',
                    type: TaskTypes.Task,
                    inputParameters: {},
                  },
                ],
                decisions: {
                  caseA: [
                    {
                      name: 'eiei',
                      taskReferenceName: 'decision_task_1_case3_2_caseA_1',
                      type: TaskTypes.Task,
                      inputParameters: {},
                    },
                    {
                      name: 'eiei',
                      taskReferenceName: 'decision_task_1_case3_2_caseA_2',
                      type: TaskTypes.Task,
                      inputParameters: {},
                    },
                  ],
                  caseB: [
                    {
                      name: 'eiei',
                      taskReferenceName: 'decision_task_1_case3_2_caseB_1',
                      type: TaskTypes.Task,
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
          type: TaskTypes.SubWorkflow,
          inputParameters: {},
          workflow: {
            name: 'lol',
            rev: '5',
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
});
