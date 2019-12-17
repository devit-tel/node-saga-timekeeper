import { Event, State } from '@melonade/melonade-declaration';
import { consumerEventsClient, poll } from './kafka';
import { timerInstanceStore } from './store';

const handleAckTask = async (task: Event.ITaskUpdate) => {
  return timerInstanceStore.update({
    timerId: task.taskId,
    ackTimeout: true,
    timeout: false,
  });
};

const handleFinishedTask = async (task: Event.ITaskUpdate) => {
  return timerInstanceStore.update({
    timerId: task.taskId,
    ackTimeout: true,
    timeout: true,
  });
};

export const executor = async () => {
  try {
    const taskUpdates: Event.ITaskUpdate[] = await poll(
      consumerEventsClient,
      100,
    );

    for (const taskUpdate of taskUpdates) {
      switch (taskUpdate.status) {
        case State.TaskStates.Inprogress:
          await handleAckTask(taskUpdate);
          break;
        case State.TaskStates.Completed:
        case State.TaskStates.Failed:
          await handleFinishedTask(taskUpdate);
          break;
        default:
          break;
      }
    }

    consumerEventsClient.commit();
  } catch (error) {
    console.log(error);
  } finally {
    setImmediate(executor);
  }
};
