import MemoryStore from './MemoryStore';
import * as TaskC from '../constants/task';

const TaskStore = new MemoryStore('Task');
// const WorkflowStore = new MemoryStore('Workflow');

export const getTaskFromStore = async (taskId: string): Promise<TaskC.Task> => {
  return TaskStore.getValue(taskId);
};

export const saveTaskToStore = async (
  taskId: string,
  value: TaskC.Task,
): Promise<TaskC.Task> => {
  return TaskStore.setValue(taskId, value);
};
