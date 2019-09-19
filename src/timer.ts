import { ITask } from './task';
import {
  poll,
  consumerTimerClient,
  updateTask,
  IEvent,
  dispatch,
} from './kafka';
import { timerInstanceStore } from './store';
import { TaskStates } from './constants/task';
import * as R from 'ramda';

export interface ITimerData {
  ackTimeout: boolean;
  timeout: boolean;
  delay: boolean;
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
        task.ackTimeout + task.startTime - Date.now() < 0 ||
        task.timeout + task.startTime - Date.now() < 0
      ) {
        console.log('send first timeout');
        updateTask({
          taskId: task.taskId,
          transactionId: task.transactionId,
          isSystem: true,
          status: TaskStates.Timeout,
        });
      } else if (task.ackTimeout > 0 || task.timeout > 0) {
        await timerInstanceStore.create({
          task,
          timeout: task.timeout > 0,
          ackTimeout: task.ackTimeout > 0,
          delay: false,
        });
        timerPartitions['0'][task.taskId] = {};

        if (task.ackTimeout > 0) {
          timerPartitions['0'][task.taskId].ackTimeout = setTimeout(() => {
            console.log('send ack timeout');
            clearTimeout(timerPartitions['0'][task.taskId].timeout);
            updateTask({
              taskId: task.taskId,
              transactionId: task.transactionId,
              isSystem: true,
              status: TaskStates.Timeout,
            });
            timerInstanceStore.delete(task.taskId);
          }, task.ackTimeout + task.startTime - Date.now());
        }

        if (task.timeout > 0) {
          timerPartitions['0'][task.taskId].timeout = setTimeout(() => {
            console.log('send timeout');
            updateTask({
              taskId: task.taskId,
              transactionId: task.transactionId,
              isSystem: true,
              status: TaskStates.Timeout,
            });
            timerInstanceStore.delete(task.taskId);
          }, task.timeout + task.startTime - Date.now());
        }
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
        if (R.path(['0', task.taskId, 'ackTimeout'], timerPartitions)) {
          console.log('cancle ack timeout');
          clearTimeout(timerPartitions['0'][task.taskId].ackTimeout);
          delete timerPartitions['0'][task.taskId].ackTimeout;
          if (task.timeout > 0) {
            return timerInstanceStore.update({
              taskId: task.taskId,
              ackTimeout: true,
            });
          }
          return timerInstanceStore.delete(task.taskId);
        }
        return null;
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
        console.log('cancle ackTimeout/timeout');
        clearTimeout(timerPartitions['0'][task.taskId].ackTimeout);
        clearTimeout(timerPartitions['0'][task.taskId].timeout);
        delete timerPartitions['0'][task.taskId].ackTimeout;
        delete timerPartitions['0'][task.taskId].timeout;
        return timerInstanceStore.delete(task.taskId);
      } catch (error) {
        console.log(error);
        return null;
      }
    }),
  );
};

const recoveryTasks = async (tasks: ITask[]) => {
  const failedTasks = tasks.filter(
    (task: ITask) => task.status === TaskStates.Failed && task.retries > 0,
  );
  return Promise.all(
    failedTasks.map(async (task: ITask) => {
      try {
        await timerInstanceStore.create({
          task,
          timeout: task.timeout > 0,
          ackTimeout: task.ackTimeout > 0,
          delay: false,
        });
        timerPartitions['0'][task.taskId].delay = setTimeout(() => {
          console.log('dispatch delay task');
          dispatch(task);
        }, task.retryDelay + task.endTime - Date.now());
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

    await Promise.all([
      recoveryTasks(tasks),
      await Promise.all([
        handleScheduleTask(tasks),
        handleAckTask(tasks),
        handleFinishedTask(tasks),
      ]),
    ]);

    consumerTimerClient.commit();
  } catch (error) {
    console.log(error);
  } finally {
    setImmediate(executor);
  }
};
