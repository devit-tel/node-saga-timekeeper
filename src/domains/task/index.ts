import { taskInstanceStore } from '../../store';
import { Task } from '../../task';

export const listRunningTasks = async (): Promise<Task[]> => {
  return (await taskInstanceStore.list()).map((workflow: Task) =>
    workflow.toObject(),
  );
};
