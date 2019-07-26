import * as R from 'ramda';
import * as TaskC from './constants/task';
import * as WorkflowC from './constants/workflow';
import * as CommonUtils from './utils/common';
// import * as Store from './stores';
import * as Workflow from './workflow';
// import * as Task from './task';

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
//   const task: TaskC.Task = await Store.getTaskFromStore(taskUpdate.taskId);
//   const updatedTask = processTask(task, taskUpdate);

//   if (updatedTask.status === TaskC.TaskStates.Completed) {
//     // TODO start next task
//   }
//   return Store.saveTaskToStore(taskUpdate.taskId, updatedTask);
// };

// This job should handled by Task's class
// export const walkForNextTasks = (
//   tasks: WorkflowC.AllTaskType[],
//   currentPath: (string | number)[] = [0],
// ): WorkflowC.AllTaskType[] => {
//   // When finish all tasks
//   if (R.equals([tasks.length - 1], currentPath)) return null;
//   const currentTask: WorkflowC.AllTaskType = R.path(currentPath, tasks);
//   console.log(currentTask.type);
//   switch (currentTask.type) {
//     case TaskC.TaskTypes.Decision:
//       // TODO Map output to new task
//       return [R.path([...currentPath, 'defaultDecision', 0], tasks)];
//     case TaskC.TaskTypes.Parallel:
//       return R.pathOr([], [...currentPath, 'parallelTasks'], tasks).map(
//         R.path([0]),
//       );
//     case TaskC.TaskTypes.Task:
//     case TaskC.TaskTypes.SubWorkflow:
//       return [R.path(getNextWalkPath(tasks, currentPath), tasks)];
//   }
// };

const getNextPath = (currentPath: (string | number)[]): (string | number)[] => [
  ...R.init(currentPath),
  +R.last(currentPath) + 1,
];

const isChildOfDecisionDefault = (
  tasks: WorkflowC.AllTaskType[],
  currentPath: (string | number)[],
): boolean =>
  R.pathEq(
    [...R.dropLast(2, currentPath), 'type'],
    TaskC.TaskTypes.Decision,
    tasks,
  ) && R.nth(-2, currentPath) === 'defaultDecision';

const isChildOfDecisionCase = (
  tasks: WorkflowC.AllTaskType[],
  currentPath: (string | number)[],
): boolean =>
  R.pathEq(
    [...R.dropLast(3, currentPath), 'type'],
    TaskC.TaskTypes.Decision,
    tasks,
  ) && R.nth(-3, currentPath) === 'decisions';

export const getNextTaskPath = (
  tasks: WorkflowC.AllTaskType[],
  currentPath: (string | number)[],
): (string | number)[] => {
  // Check if this's the final task
  if (R.equals([tasks.length - 1], currentPath)) return null;

  switch (true) {
    case !!R.path(getNextPath(currentPath), tasks):
      return getNextPath(currentPath);
    case R.pathEq(
      [...R.dropLast(2, currentPath), 'type'],
      TaskC.TaskTypes.Parallel,
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
  return findTaskPath(taskReferenceNames, tasks, getNextPath(currentPath));
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
  return findTaskPath(taskReferenceNames, tasks, getNextPath(currentPath));
};

export const getWorkflowTask = (
  taskReferenceNames: string,
  workflowDefinition: Workflow.WorkflowDefinition,
): WorkflowC.AllTaskType => {
  const taskPath = findTaskPath(taskReferenceNames, workflowDefinition.tasks);
  if (!taskPath)
    throw new Error(`taskReferenceNames: "${taskReferenceNames}" not found`);
  return R.path(taskPath, workflowDefinition.tasks);
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
          return findTaskPath(
            taskReferenceNames,
            tasks,
            getNextPath(currentPath),
          );
      }
  else return null;
};
