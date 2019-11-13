import { Task, State } from '@melonade/melonade-declaration';
import { poll, consumerTasksClient, updateTask } from './kafka';
import { timerInstanceStore } from './store';

const handleScheduleTask = async (tasks: Task.ITask[]) => {
  const scheduleTasks = tasks.filter(
    (task: Task.ITask) => task.status === State.TaskStates.Scheduled,
  );
  await Promise.all(
    scheduleTasks.map(async (task: Task.ITask) => {
      const beforeAckTimeout = task.ackTimeout + task.startTime - Date.now();
      const beforeTimeout = task.timeout + task.startTime - Date.now();
      if (task.ackTimeout > 0 && beforeAckTimeout < 0) {
        console.log('send acktimeout delay consume');
        updateTask({
          taskId: task.taskId,
          transactionId: task.transactionId,
          isSystem: true,
          status: State.TaskStates.AckTimeOut,
        });
      } else if (task.timeout > 0 && beforeTimeout < 0) {
        console.log('send timeout delay consume');
        updateTask({
          taskId: task.taskId,
          transactionId: task.transactionId,
          isSystem: true,
          status: State.TaskStates.Timeout,
        });
      } else if (task.ackTimeout > 0 || task.timeout > 0) {
        await timerInstanceStore.create({
          task,
          ackTimeout: task.ackTimeout > 0 ? beforeAckTimeout : 0,
          timeout: task.timeout > 0 ? beforeTimeout : 0,
          delay: 0,
        });
      }
    }),
  );
};

export const executor = async () => {
  try {
    const tasks: Task.ITask[] = await poll(consumerTasksClient, 100);

    await handleScheduleTask(
      tasks.filter((task: Task.ITask) => {
        return (
          task.type === Task.TaskTypes.Task &&
          (task.ackTimeout > 0 || task.timeout > 0)
        );
      }),
    );

    consumerTasksClient.commit();
  } catch (error) {
    console.log(error);
  } finally {
    setImmediate(executor);
  }
};
