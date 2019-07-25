import * as R from 'ramda';
import * as TaskC from './constants/task';
import * as WorkflowC from './constants/workflow';
import * as CommonUtils from './utils/common';

export const isAbleToTranslateTaskStatus = (
  currentStatus: TaskC.TaskStates,
  status: TaskC.TaskStates,
): boolean => {
  if (TaskC.TaskNextStates[currentStatus]) {
    if (TaskC.TaskNextStates[currentStatus].includes(status)) return true;
    return false;
  }
  throw new Error(`Current status: "${currentStatus}" is invalid`);
};

export const processTask = (
  task: TaskC.Task,
  taskUpdate: TaskC.TaskUpdate,
): TaskC.Task => {
  if (!isAbleToTranslateTaskStatus(task.status, taskUpdate.status))
    throw new Error(
      `Cannot change status from ${task.status} to ${taskUpdate.status}`,
    );

  return {
    ...task,
    status: taskUpdate.status,
    output: R.isNil(taskUpdate.output) ? task.output : taskUpdate.output,
    logs: CommonUtils.concatArray(task.logs, taskUpdate.logs),
  };
};

// export const updateTask = async (
//   taskUpdate: TaskC.TaskUpdate,
// ): Promise<TaskC.Task> => {
//   // TODO Imprement mutex for store
//   const task: TaskC.Task = {}; // await getTaskFromStore(taskUpdate.taskId);
//   const updatedTask = processTask(task, taskUpdate);

//   if (updatedTask.status === TaskC.TaskStates.Completed) {
//     // TODO start next task
//   }
//   // await saveTaskToStore(taskUpdate.taskId, updatedTask);
//   return updatedTask;
// };

// export const walkForNextTasks = (
//   taskReferenceNames: string,
//   tasks: WorkflowC.AllTaskType[],
//   currentPath: (string | number)[] = [0],
// ): WorkflowC.AllTaskType[] => {
//   const currentTask: WorkflowC.AllTaskType = R.path(currentPath, tasks);
//   if (currentTask)
//     if (currentTask.taskReferenceName === taskReferenceNames)
//       switch (currentTask.type) {
//         case TaskC.TaskTypes.Task:
//           break;

//         default:
//           break;
//       }
//     else return;
//   else
//     switch (key) {
//       case value:
//         break;

//       default:
//         break;
//     }
// };

const findNextTaskPath = (
  taskReferenceNames: string,
  tasks: WorkflowC.AllTaskType[],
  currentPath: (string | number)[],
): (string | number)[] =>
  findTaskPath(taskReferenceNames, tasks, [
    ...R.init(currentPath),
    +R.last(currentPath) + 1,
  ]);

export const findNextParallelTaskPath = (
  taskReferenceNames: string,
  tasks: WorkflowC.AllTaskType[],
  currentPath: (string | number)[],
  currentTask: WorkflowC.ParallelTask,
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
  return findNextTaskPath(taskReferenceNames, tasks, currentPath);
};

export const findNextDecisionTaskPath = (
  taskReferenceNames: string,
  tasks: WorkflowC.AllTaskType[],
  currentPath: (string | number)[],
  currentTask: WorkflowC.DecisionTask,
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
  return findNextTaskPath(taskReferenceNames, tasks, currentPath);
};

export const findTaskPath = (
  taskReferenceNames: string,
  tasks: WorkflowC.AllTaskType[],
  currentPath: (string | number)[] = [0],
): (string | number)[] => {
  const currentTask: WorkflowC.AllTaskType = R.path(currentPath, tasks);
  if (currentTask)
    if (currentTask.taskReferenceName === taskReferenceNames)
      return currentPath;
    else
      switch (currentTask.type) {
        case TaskC.TaskTypes.Parallel:
          return findNextParallelTaskPath(
            taskReferenceNames,
            tasks,
            currentPath,
            currentTask,
          );
        case TaskC.TaskTypes.Decision:
          return findNextDecisionTaskPath(
            taskReferenceNames,
            tasks,
            currentPath,
            currentTask,
          );
        case TaskC.TaskTypes.SubWorkflow:
        case TaskC.TaskTypes.Task:
        default:
          return findNextTaskPath(taskReferenceNames, tasks, currentPath);
      }
  else return null;
};
