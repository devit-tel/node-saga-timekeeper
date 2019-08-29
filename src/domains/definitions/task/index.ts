import {
  TaskDefinition,
  ITaskDefinitionData,
  ITaskDefinition,
} from '../../../taskDefinition';
import { taskDefinitionStore } from '../../../store';
import { createTopic } from '../../../kafka';

export const createTaskDefinition = async (
  taskDefinitionData: ITaskDefinitionData,
): Promise<any> => {
  const taskDefinition = new TaskDefinition(taskDefinitionData);
  await taskDefinitionStore.create(taskDefinition);
  await createTopic(`TASK_${taskDefinition.name}`);
};

export const getTaskDefinition = (
  taskName: string,
): Promise<ITaskDefinition> => {
  return taskDefinitionStore.get(taskName);
};

export const listTaskDefinition = (): Promise<ITaskDefinition[]> => {
  return taskDefinitionStore.list();
};
