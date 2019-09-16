import { ITask } from './task';
import { poll, consumerTimerClient, updateTask, IEvent } from './kafka';
import { timerInstanceStore } from './store';
import { TaskStates } from './constants/task';

export interface ITimerData {
  ackTimeout: boolean;
  timeout: boolean;
  task: ITask;
}

export interface ITimerUpdate {
  ackTimeout?: boolean;
  timeout?: boolean;
  taskId: string;
}

const timerPartitions = {
  '0': {},
};

const handleScheduleTask = async (tasks: ITask[]) => {
  const scheduleTasks = tasks.filter(
    (task: ITask) => task.status === TaskStates.Scheduled,
  );

  await Promise.all(
    scheduleTasks.map(async (task: ITask) => {
      if (
        Date.now() - (task.ackTimeout + task.startTime) < 0 ||
        Date.now() - (task.timeout + task.startTime) < 0
      ) {
        updateTask({
          taskId: task.taskId,
          transactionId: task.transactionId,
          isSystem: true,
          status: TaskStates.Timeout,
        });
      } else {
        await timerInstanceStore.create({
          task,
          timeout: false,
          ackTimeout: false,
        });

        const ackTimeout = setTimeout(() => {
          clearTimeout(timerPartitions['0'][task.taskId].timeout);
          updateTask({
            taskId: task.taskId,
            transactionId: task.transactionId,
            isSystem: true,
            status: TaskStates.Timeout,
          });
          timerInstanceStore.delete(task.taskId);
        }, Date.now() - (task.ackTimeout + task.startTime));

        const timeout = setTimeout(() => {
          updateTask({
            taskId: task.taskId,
            transactionId: task.transactionId,
            isSystem: true,
            status: TaskStates.Timeout,
          });
          timerInstanceStore.delete(task.taskId);
        }, Date.now() - (task.timeout + task.startTime));

        timerPartitions['0'][task.taskId] = {
          ackTimeout,
          timeout,
        };
      }
    }),
  );
};

const handleAckTask = async (tasks: ITask[]) => {
  const inprogressTasks = tasks.filter(
    (task: ITask) => task.status === TaskStates.Inprogress,
  );

  return Promise.all(
    inprogressTasks.map((task: ITask) => {
      try {
        clearTimeout(timerPartitions['0'][task.taskId].ackTimeout);
        return timerInstanceStore.update({
          taskId: task.taskId,
          ackTimeout: true,
        });
      } catch (error) {
        console.log(error);
        return null;
      }
    }),
  );
};

const handleFinishedTask = async (tasks: ITask[]) => {
  const finishedTasks = tasks.filter((task: ITask) =>
    [TaskStates.Completed, TaskStates.Failed].includes(task.status),
  );

  return Promise.all(
    finishedTasks.map((task: ITask) => {
      try {
        clearTimeout(timerPartitions['0'][task.taskId].timeout);
        return timerInstanceStore.update({
          taskId: task.taskId,
          timeout: true,
        });
      } catch (error) {
        console.log(error);
        return null;
      }
    }),
  );
};

export const executor = async () => {
  try {
    const events: IEvent[] = await poll(consumerTimerClient, 100);

    const tasks = events.reduce((result: ITask[], event: IEvent) => {
      if (event.type === 'TASK' && event.isError === false) {
        result.push(event.details);
      }
      return result;
    }, []);

    await handleScheduleTask(tasks);
    await handleAckTask(tasks);
    await handleFinishedTask(tasks);

    consumerTimerClient.commit();
  } catch (error) {
    console.log(error);
  } finally {
    setImmediate(executor);
  }
};
