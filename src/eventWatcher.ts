import { Event, State } from '@melonade/melonade-declaration';
import { poll, consumerEventsClient } from './kafka';
import { timerInstanceStore } from './store';

const handleAckTask = async (tasks: Event.ITaskUpdate[]) => {
  const inprogressTasks = tasks.filter(
    (task: Event.ITaskUpdate) => task.status === State.TaskStates.Inprogress,
  );
  return Promise.all(
    inprogressTasks.map((task: Event.ITaskUpdate) => {
      return timerInstanceStore.update({
        taskId: task.taskId,
        ackTimeout: true,
        timeout: false,
      });
    }),
  );
};

const handleFinishedTask = async (tasks: Event.ITaskUpdate[]) => {
  const finishedTasks = tasks.filter((task: Event.ITaskUpdate) =>
    [State.TaskStates.Completed, State.TaskStates.Failed].includes(task.status),
  );
  return Promise.all(
    finishedTasks.map((task: Event.ITaskUpdate) => {
      return timerInstanceStore.update({
        taskId: task.taskId,
        ackTimeout: true,
        timeout: true,
      });
    }),
  );
};

export const executor = async () => {
  try {
    const taskUpdates: Event.ITaskUpdate[] = await poll(
      consumerEventsClient,
      100,
    );

    await Promise.all([
      handleAckTask(taskUpdates),
      handleFinishedTask(taskUpdates),
    ]);
    consumerEventsClient.commit();
  } catch (error) {
    console.log(error);
  } finally {
    setImmediate(executor);
  }
};
