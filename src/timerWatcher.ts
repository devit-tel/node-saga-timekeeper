import { State, Timer } from '@melonade/melonade-declaration';
import {
  consumerTimerClient,
  delayTimer,
  poll,
  reloadTask,
  TimerInstanceTypes,
  updateTask,
} from './kafka';
import { sleep } from './utils/common';

const handleDelayTimer = (timer: Timer.IDelayTaskTimer) => {
  const beforeDispatch = timer.task.startTime - Date.now();

  if (beforeDispatch > 0) {
    delayTimer({
      scheduledAt: timer.task.startTime,
      type: TimerInstanceTypes.Delay,
      task: timer.task,
    });
  } else {
    reloadTask(timer.task);
  }
};

const handleScheduleTimer = (timer: Timer.IScheduleTaskTimer) => {
  const beforeDispatch = timer.completedAt - Date.now();
  updateTask({
    transactionId: timer.transactionId,
    taskId: timer.taskId,
    isSystem: true,
    status: State.TaskStates.Inprogress,
  });
  console.log(beforeDispatch, timer.transactionId);
  if (beforeDispatch > 0) {
    delayTimer({
      scheduledAt: timer.completedAt,
      type: TimerInstanceTypes.Complete,
      transactionId: timer.transactionId,
      taskId: timer.taskId,
    });
  } else {
    updateTask({
      transactionId: timer.transactionId,
      taskId: timer.taskId,
      isSystem: true,
      status: State.TaskStates.Completed,
    });
  }
};

export const executor = async () => {
  try {
    const timers: Timer.AllTimerType[] = await poll(consumerTimerClient, 100);
    if (timers.length) {
      for (const timer of timers) {
        switch (timer.type) {
          case Timer.TimerTypes.delayTask:
            handleDelayTimer(timer);
            break;
          case Timer.TimerTypes.scheduleTask:
            handleScheduleTimer(timer);
            break;
          // Not support cron workflow yet
          case Timer.TimerTypes.cronWorkflow:
          default:
            break;
        }
      }
    }
    consumerTimerClient.commit();
  } catch (error) {
    console.warn(error);
    await sleep(1000);
  } finally {
    setImmediate(executor);
  }
};
