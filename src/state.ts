import * as R from 'ramda';
import * as TaskC from './constants/task';
import * as CommonUtils from './utils/common';

export const isAbleToTranslateTaskStatus = (
  currentStatus: TaskC.TaskStates,
  status: TaskC.TaskStates,
): boolean => {
  if (TaskC.TaskNextStates[currentStatus]) {
    if (TaskC.TaskNextStates[currentStatus].includes(status)) {
      return true;
    }
    return false;
  }
  throw new Error(`Current status: "${currentStatus}" is invalid`);
};

export const updateTask = (
  task: TaskC.Task,
  taskUpdate: TaskC.TaskUpdate,
): TaskC.Task => {
  if (!isAbleToTranslateTaskStatus(task.status, taskUpdate.status)) {
    throw new Error(
      `Cannot change status from ${task.status} to ${taskUpdate.status}`,
    );
  }
  return {
    ...task,
    status: taskUpdate.status,
    output: R.isNil(taskUpdate.output) ? task.output : taskUpdate.output,
    logs: CommonUtils.concatArray(task.logs, taskUpdate.logs),
  };
};
