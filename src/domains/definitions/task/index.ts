import { TaskDefinition } from '../../../taskDefinition';
import { taskDefinitionStore } from '../../../store';

export const createTaskDefinition = async (
  taskDefinition: TaskDefinition,
): Promise<any> => {
  await taskDefinitionStore.setValue(taskDefinition.name, taskDefinition);
};

export const getTaskDefinition = (
  taskName: string,
): Promise<TaskDefinition> => {
  return taskDefinitionStore.getValue(taskName);
};

export const listTaskDefinition = (
  limit: number,
  offset: number,
): Promise<TaskDefinition[]> => {
  return taskDefinitionStore.list(limit, offset);
};
