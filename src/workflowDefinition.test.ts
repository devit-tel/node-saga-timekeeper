import { WorkflowDefinition } from './workflowDefinition';
import { TaskTypes } from './constants/task';
import { FailureStrategies } from './constants/workflow';

jest.mock('uuid/v4');
Date.now = jest.fn();

describe('Workflow Def', () => {
  describe('Create workflow', () => {
    test('Default value', () => {
      expect(
        new WorkflowDefinition({
          name: 'hello-world',
          rev: '1',
          tasks: [
            {
              name: 'huhu',
              taskReferenceName: 'HUHU',
              type: TaskTypes.SubWorkflow,
              inputParameters: {
                a: 'b',
              },
              workflow: {
                name: 'a',
                rev: '1',
              },
            },
          ],
        }).toObject(),
      ).toEqual({
        name: 'hello-world',
        rev: '1',
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
              rev: '1',
            },
          },
        ],
      });
    });

    test('Invalid name', () => {
      expect(
        () =>
          new WorkflowDefinition({
            name: '',
            rev: '1',
            tasks: [
              {
                name: 'huhu',
                taskReferenceName: 'HUHU',
                type: TaskTypes.Task,
                inputParameters: {
                  a: 'b',
                },
              },
            ],
          }),
      ).toThrow('workflowDefinition.name is invalid');
    });

    test('Invalid rev', () => {
      expect(
        () =>
          new WorkflowDefinition({
            name: 'hello-world',
            rev: undefined,
            tasks: [
              {
                name: 'huhu',
                taskReferenceName: 'HUHU',
                type: TaskTypes.Task,
                inputParameters: {
                  a: 'b',
                },
              },
            ],
          }),
      ).toThrow('workflowDefinition.rev is invalid');
    });

    test('failureStrategy to "RECOVERY_WORKFLOW" without recoveryWorkflow param', () => {
      expect(
        () =>
          new WorkflowDefinition({
            name: 'hello-world',
            rev: '1',
            tasks: [
              {
                name: 'huhu',
                taskReferenceName: 'HUHU',
                type: TaskTypes.SubWorkflow,
                inputParameters: {
                  a: 'b',
                },
                workflow: {
                  name: 'a',
                  rev: '1',
                },
              },
            ],
            failureStrategy: FailureStrategies.RecoveryWorkflow,
          }),
      ).toThrow('workflowDefinition.recoveryWorkflow is invalid');
    });

    test('failureStrategy to "RECOVERY_WORKFLOW" with recoveryWorkflow param', () => {
      expect(
        new WorkflowDefinition({
          name: 'hello-world',
          rev: '1',
          tasks: [
            {
              name: 'huhu',
              taskReferenceName: 'HUHU',
              type: TaskTypes.SubWorkflow,
              inputParameters: {
                a: 'b',
              },
              workflow: {
                name: 'a',
                rev: '1',
              },
            },
          ],
          failureStrategy: FailureStrategies.RecoveryWorkflow,
          recoveryWorkflow: {
            name: 'hihi',
            rev: '2',
          },
        }).toObject(),
      ).toEqual({
        description: 'No description',
        failureStrategy: 'RECOVERY_WORKFLOW',
        name: 'hello-world',
        recoveryWorkflow: {
          name: 'hihi',
          rev: '2',
        },
        rev: '1',
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
              rev: '1',
            },
          },
        ],
      });
    });

    test('failureStrategy to "RETRY" without retry param', () => {
      expect(
        () =>
          new WorkflowDefinition({
            name: 'hello-world',
            rev: '1',
            tasks: [
              {
                name: 'huhu',
                taskReferenceName: 'HUHU',
                type: TaskTypes.SubWorkflow,
                inputParameters: {
                  a: 'b',
                },
                workflow: {
                  name: 'a',
                  rev: '1',
                },
              },
            ],
            failureStrategy: FailureStrategies.Retry,
          }),
      ).toThrow('workflowDefinition.retry is invalid');
    });

    test('failureStrategy to "RETRY" with retry param', () => {
      expect(
        new WorkflowDefinition({
          name: 'hello-world',
          rev: '1',
          tasks: [
            {
              name: 'huhu',
              taskReferenceName: 'HUHU',
              type: TaskTypes.SubWorkflow,
              inputParameters: {
                a: 'b',
              },
              workflow: {
                name: 'a',
                rev: '1',
              },
            },
          ],
          failureStrategy: FailureStrategies.Retry,
          retry: {
            delaySecond: 3,
            limit: 2,
          },
        }).toObject(),
      ).toEqual({
        description: 'No description',
        failureStrategy: 'RETRY',
        name: 'hello-world',
        rev: '1',
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
              rev: '1',
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
          new WorkflowDefinition({
            name: 'hello-world',
            rev: '1',
            tasks: [],
          }),
      ).toThrow('workflowDefinition.tasks cannot be empty');
    });

    test('Invalid WorkflowDefinition', () => {
      expect(
        () =>
          new WorkflowDefinition(
            JSON.parse(
              JSON.stringify({
                name: 'hello-world',
                rev: '1',
                tasks: [
                  {
                    name: 'eiei',
                    taskReferenceName: 'eiei',
                    // type: TaskTypes.Task,
                    type: 'SOME_RAMDON_TYPE',
                    inputParameters: {},
                  },
                  {
                    // name: 'task002',
                    taskReferenceName: 'lol',
                    type: TaskTypes.Decision,
                    inputParameters: {},
                    defaultDecision: [
                      // {
                      //   name: 'default_one',
                      //   taskReferenceName: 'default_one',
                      //   type: TaskTypes.Task,
                      //   inputParameters: {},
                      // },
                    ],
                    decisions: {
                      case1: [
                        {
                          name: 'huhu',
                          // taskReferenceName: 'lol_2',
                          taskReferenceName: 'lol',
                          type: TaskTypes.Decision,
                          inputParameters: {},
                          defaultDecision: [
                            {
                              name: 'eiei',
                              // taskReferenceName: 'case1_eiei',
                              type: TaskTypes.Task,
                              inputParameters: {},
                            },
                          ],
                        },
                      ],
                    },
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
                          taskReferenceName: 'parallel_child1',
                          type: TaskTypes.Task,
                          inputParameters: {},
                        },
                      ],
                      [
                        {
                          name: 'eiei',
                          taskReferenceName: 'parallel_child2',
                          type: TaskTypes.SubWorkflow,
                          inputParameters: {},
                          // workflow: {
                          //   name: 'haha',
                          //   rev: '3',
                          // },
                        },
                        {
                          name: 'eiei',
                          taskReferenceName: 'parallel_child3',
                          type: TaskTypes.Task,
                          inputParameters: {},
                        },
                      ],
                    ],
                  },
                ],
              }),
            ),
          ),
      ).toThrow(
        [
          'workflowDefinition.tasks[0].type is invalid',
          'workflowDefinition.tasks[1].name is invalid',
          'workflowDefinition.tasks[1].defaultDecision cannot be empty',
          'workflowDefinition.tasks[1].decisions["case1"].tasks[0].taskReferenceName is duplicated',
          'workflowDefinition.tasks[1].decisions["case1"].tasks[0].defaultDecision.tasks[0].taskReferenceName is invalid',
          'workflowDefinition.tasks[2].parallelTasks[1].tasks[0].workflow.name is invalid',
          'workflowDefinition.tasks[2].parallelTasks[1].tasks[0].workflow.rev is invalid',
        ].join('\n'),
      );
    });

    // tslint:disable-next-line: max-func-body-length
    test('Nested WorkflowDefinition', () => {
      expect(
        new WorkflowDefinition({
          name: 'hello-world',
          rev: '1',
          tasks: [
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
                          taskReferenceName: 'parallel22_child1',
                          type: TaskTypes.Task,
                          inputParameters: {},
                        },
                        {
                          name: 'eiei',
                          taskReferenceName: 'parallel22_child2',
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
          ],
        }).toObject(),
      ).toEqual({
        description: 'No description',
        name: 'hello-world',
        rev: '1',
        tasks: [
          {
            inputParameters: {},
            name: 'eiei',
            taskReferenceName: 'eiei',
            type: 'TASK',
          },
          {
            inputParameters: {},
            name: 'eiei',
            parallelTasks: [
              [
                {
                  inputParameters: {},
                  name: 'eiei',
                  parallelTasks: [
                    [
                      {
                        inputParameters: {},
                        name: 'eiei',
                        taskReferenceName: 'parallel12_child1',
                        type: 'TASK',
                      },
                      {
                        inputParameters: {},
                        name: 'eiei',
                        taskReferenceName: 'parallel12_child2',
                        type: 'TASK',
                      },
                    ],
                    [
                      {
                        inputParameters: {},
                        name: 'eiei',
                        taskReferenceName: 'parallel22_child1',
                        type: 'TASK',
                      },
                      {
                        inputParameters: {},
                        name: 'eiei',
                        taskReferenceName: 'parallel22_child2',
                        type: 'TASK',
                      },
                    ],
                  ],
                  taskReferenceName: 'parallel1_child2',
                  type: 'PARALLEL',
                },
                {
                  inputParameters: {},
                  name: 'eiei',
                  taskReferenceName: 'parallel1_child1',
                  type: 'TASK',
                },
              ],
              [
                {
                  inputParameters: {},
                  name: 'eiei',
                  taskReferenceName: 'parallel2_child1',
                  type: 'TASK',
                },
                {
                  inputParameters: {},
                  name: 'eiei',
                  taskReferenceName: 'parallel2_child2',
                  type: 'TASK',
                },
              ],
            ],
            taskReferenceName: 'PARALLEL_TASK',
            type: 'PARALLEL',
          },
        ],
      });
    });
  });
});
