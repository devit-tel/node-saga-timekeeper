import { TaskDefinition, ITaskDefinitionData } from '../../../taskDefinition';
import { taskDefinitionStore } from '../../../store';
import { createTopic } from '../../../kafka';

export const createTaskDefinition = async (
  taskDefinitionData: ITaskDefinitionData,
): Promise<any> => {
  const taskDefinition = new TaskDefinition(taskDefinitionData);
  await taskDefinitionStore.setValue(
    taskDefinition.name,
    taskDefinition.toJSON(),
  );
  await createTopic(
    `TASK_${taskDefinition.name}`,
    taskDefinition.topicConfigurations,
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
