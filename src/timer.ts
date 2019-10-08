import { Task, Event, State } from '@melonade/melonade-declaration';
import { poll, consumerTimerClient, updateTask, dispatch } from './kafka';
import { timerInstanceStore } from './store';

export interface ITimerData {
  ackTimeout: number;
  timeout: number;
  delay: number;
  task: Task.ITask;
}

const handleScheduleTask = async (tasks: Task.ITask[]) => {
  const scheduleTasks = tasks.filter(
    (task: Task.ITask) => task.status === State.TaskStates.Scheduled,
  );
  await Promise.all(
    scheduleTasks.map(async (task: Task.ITask) => {
      const beforeAckTimeout = task.ackTimeout + task.startTime - Date.now();
      const beforeTimeout = task.timeout + task.startTime - Date.now();
      if (
        (task.ackTimeout > 0 && beforeAckTimeout < 0) ||
        (task.timeout > 0 && beforeTimeout < 0)
      ) {
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

const handleAckTask = async (tasks: Task.ITask[]) => {
  const inprogressTasks = tasks.filter(
    (task: Task.ITask) => task.status === State.TaskStates.Inprogress,
  );
  return Promise.all(
    inprogressTasks.map((task: Task.ITask) => {
      return timerInstanceStore.update({
        taskId: task.taskId,
        ackTimeout: true,
        timeout: false,
      });
    }),
  );
};

const handleFinishedTask = async (tasks: Task.ITask[]) => {
  const finishedTasks = tasks.filter((task: Task.ITask) =>
    [State.TaskStates.Completed, State.TaskStates.Failed].includes(task.status),
  );
  return Promise.all(
    finishedTasks.map((task: Task.ITask) => {
      return timerInstanceStore.update({
        taskId: task.taskId,
        ackTimeout: true,
        timeout: true,
      });
    }),
  );
};

const recoveryTasks = async (tasks: Task.ITask[]) => {
  const failedTasks = tasks.filter(
    (task: Task.ITask) =>
      [State.TaskStates.Failed, State.TaskStates.Timeout].includes(
        task.status,
      ) && task.retries > 0,
  );
  return Promise.all(
    failedTasks.map((task: Task.ITask) => {
      const beforeDispatch = task.retryDelay + task.endTime - Date.now();
      if (beforeDispatch > 0) {
        return timerInstanceStore.create({
          task,
          ackTimeout: 0,
          timeout: 0,
          delay: task.retryDelay + task.endTime - Date.now(),
        });
      }
      return dispatch(task);
    }),
  );
};

export const executor = async () => {
  try {
    const events: Event.AllEvent[] = await poll(consumerTimerClient, 100);

    const tasks = events.reduce(
      (result: Task.ITask[], event: Event.AllEvent) => {
        if (event.type === 'TASK' && event.isError === false) {
          result.push(event.details);
        }
        return result;
      },
      [],
    );

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
