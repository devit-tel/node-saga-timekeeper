import { TaskDefinition } from '../../../taskDefinition';
import { taskDefinitionStore } from '../../../store';

export const createTaskDefinition = async (
  taskDefinition: TaskDefinition,
): Promise<any> => {
  await taskDefinitionStore.setValue(
    taskDefinition.name,
    new TaskDefinition(taskDefinition).toJSON(),
  );
};

export const getTaskDefinition = (
  taskName: string,
): Promise<TaskDefinition> => {
  return taskDefinitionStore.getValue(taskName);
};

export const listTaskDefinition = (
  limit: number = Number.MAX_SAFE_INTEGER,
  offset: number = 0,
): Promise<TaskDefinition[]> => {
  return taskDefinitionStore.list(limit, offset);
};
