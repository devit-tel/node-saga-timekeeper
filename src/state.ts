import * as R from 'ramda';
import { TaskStates, TaskNextStates, TaskTypes } from './constants/task';
import { WorkflowDefinition } from './workflowDefinition';
import { concatArray } from './utils/common';
// import * as Store from './stores';
import {
  AllTaskType,
  IParallelTask,
  IDecisionTask,
} from './workflowDefinition';
import { ITask } from './task';

export interface ITaskUpdate {
  taskId: string;
  status: TaskStates;
  output?: any;
  logs?: any[] | any;
}

export const isAbleToTranslateTaskStatus = (
  currentStatus: TaskStates,
  status: TaskStates,
): boolean => {
  if (TaskNextStates[currentStatus]) {
    if (TaskNextStates[currentStatus].includes(status)) return true;
    return false;
  }
  throw new Error(`Current status: "${currentStatus}" is invalid`);
};

export const processTask = (task: ITask, taskUpdate: ITaskUpdate): ITask => {
  if (!isAbleToTranslateTaskStatus(task.status, taskUpdate.status))
    throw new Error(
      `Cannot change status from ${task.status} to ${taskUpdate.status}`,
    );

  return {
    ...task,
    status: taskUpdate.status,
    output: R.isNil(taskUpdate.output) ? task.output : taskUpdate.output,
    logs: concatArray(task.logs, taskUpdate.logs),
  };
};

// export const updateTask = async (
//   taskUpdate: ITaskUpdate,
// ): Promise<ITask> => {
//   // TODO Imprement mutex for store
//   const task: ITask = await Store.getTaskFromStore(taskUpdate.taskId);
//   const updatedTask = processTask(task, taskUpdate);

//   if (updatedTask.status === TaskStates.Completed) {
//     // TODO start next task
//   }
//   return Store.saveTaskToStore(taskUpdate.taskId, updatedTask);
// };

// This job should handled by Task's class
// export const walkForNextTasks = (
//   tasks: AllTaskType[],
//   currentPath: (string | number)[] = [0],
// ): AllTaskType[] => {
//   // When finish all tasks
//   if (R.equals([tasks.length - 1], currentPath)) return null;
//   const currentTask: AllTaskType = R.path(currentPath, tasks);
//   console.log(currentTask.type);
//   switch (currentTask.type) {
//     case TaskTypes.Decision:
//       // TODO Map output to new task
//       return [R.path([...currentPath, 'defaultDecision', 0], tasks)];
//     case TaskTypes.Parallel:
//       return R.pathOr([], [...currentPath, 'parallelTasks'], tasks).map(
//         R.path([0]),
//       );
//     case TaskTypes.Task:
//     case TaskTypes.SubWorkflow:
//       return [R.path(getNextWalkPath(tasks, currentPath), tasks)];
//   }
// };

const getNextPath = (currentPath: (string | number)[]): (string | number)[] => [
  ...R.init(currentPath),
  +R.last(currentPath) + 1,
];

const isChildOfDecisionDefault = (
  tasks: AllTaskType[],
  currentPath: (string | number)[],
): boolean =>
  R.pathEq(
    [...R.dropLast(2, currentPath), 'type'],
    TaskTypes.Decision,
    tasks,
  ) && R.nth(-2, currentPath) === 'defaultDecision';

const isChildOfDecisionCase = (
  tasks: AllTaskType[],
  currentPath: (string | number)[],
): boolean =>
  R.pathEq(
    [...R.dropLast(3, currentPath), 'type'],
    TaskTypes.Decision,
    tasks,
  ) && R.nth(-3, currentPath) === 'decisions';

// Check if it's system task
export const getNextTaskPath = (
  tasks: AllTaskType[],
  currentPath: (string | number)[],
): (string | number)[] => {
  // Check if this's the final task
  if (R.equals([tasks.length - 1], currentPath)) return null;

  switch (true) {
    case !!R.path(getNextPath(currentPath), tasks):
      return getNextPath(currentPath);
    case R.pathEq(
      [...R.dropLast(2, currentPath), 'type'],
      TaskTypes.Parallel,
      tasks,
    ):
      // TODO Check if all child are completed
      return getNextPath(R.init(currentPath));
    case isChildOfDecisionDefault(tasks, currentPath):
      return getNextTaskPath(tasks, R.dropLast(2, currentPath));
    case isChildOfDecisionCase(tasks, currentPath):
      return getNextTaskPath(tasks, R.dropLast(3, currentPath));
    // This case should never fall
    default:
      return null;
  }
};

export const findNextParallelTaskPath = (
  taskReferenceNames: string,
  tasks: AllTaskType[],
  currentPath: (string | number)[],
  currentTask: IParallelTask,
) => {
  for (
    let pTasksIndex = 0;
    pTasksIndex < currentTask.parallelTasks.length;
    pTasksIndex++
  ) {
    const taskPath = findTaskPath(taskReferenceNames, tasks, [
      ...currentPath,
      'parallelTasks',
      pTasksIndex,
      0,
    ]);
    if (taskPath) return taskPath;
  }
  return findTaskPath(taskReferenceNames, tasks, getNextPath(currentPath));
};

export const findNextDecisionTaskPath = (
  taskReferenceNames: string,
  tasks: AllTaskType[],
  currentPath: (string | number)[],
  currentTask: IDecisionTask,
) => {
  const decisionsPath = [
    ...Object.keys(currentTask.decisions).map((decision: string) => [
      'decisions',
      decision,
    ]),
    ['defaultDecision'],
  ];
  for (const decisionPath of decisionsPath) {
    const taskPath = findTaskPath(taskReferenceNames, tasks, [
      ...currentPath,
      ...decisionPath,
      0,
    ]);
    if (taskPath) return taskPath;
  }
  return findTaskPath(taskReferenceNames, tasks, getNextPath(currentPath));
};

export const getWorkflowTask = (
  taskReferenceNames: string,
  workflowDefinition: WorkflowDefinition,
): AllTaskType => {
  const taskPath = findTaskPath(taskReferenceNames, workflowDefinition.tasks);
  if (!taskPath)
    throw new Error(`taskReferenceNames: "${taskReferenceNames}" not found`);
  return R.path(taskPath, workflowDefinition.tasks);
};

export const findTaskPath = (
  taskReferenceNames: string,
  tasks: AllTaskType[],
  currentPath: (string | number)[] = [0],
): (string | number)[] => {
  const currentTask: AllTaskType = R.path(currentPath, tasks);
  if (currentTask)
    if (currentTask.taskReferenceName === taskReferenceNames)
      return currentPath;
    else
      switch (currentTask.type) {
        case TaskTypes.Parallel:
          return findNextParallelTaskPath(
            taskReferenceNames,
            tasks,
            currentPath,
            currentTask,
          );
        case TaskTypes.Decision:
          return findNextDecisionTaskPath(
            taskReferenceNames,
            tasks,
            currentPath,
            currentTask,
          );
        case TaskTypes.SubWorkflow:
        case TaskTypes.Task:
        default:
          return findTaskPath(
            taskReferenceNames,
            tasks,
            getNextPath(currentPath),
          );
      }
  else return null;
};
