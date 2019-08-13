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

export const getTaskDefinition = async (
  taskName: string,
): Promise<TaskDefinition> => {
  return (await taskDefinitionStore.getValue(taskName)).toObject();
};

export const listTaskDefinition = async (
  limit: number = Number.MAX_SAFE_INTEGER,
  offset: number = 0,
): Promise<TaskDefinition[]> => {
  return (await taskDefinitionStore.list(limit, offset)).map(
    (taskDefinition: TaskDefinition) => taskDefinition.toObject(),
  );
};
