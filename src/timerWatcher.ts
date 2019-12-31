import { Timer } from '@melonade/melonade-declaration';
import {
  consumerTimerClient,
  poll,
  reloadTask,
  TimerInstanceTypes,
} from './kafka';
import { timerInstanceStore } from './store';

const handleDelayTimer = async (timer: Timer.IDelayTaskTimer) => {
  const whenDispatch = timer.task.retryDelay + timer.task.endTime;
  const beforeDispatch = whenDispatch - Date.now();
  if (beforeDispatch > 0) {
    await timerInstanceStore.create({
      task: timer.task,
      type: TimerInstanceTypes.Delay,
      delay: whenDispatch,
    });

    delayTimer({
      scheduledAt: beforeDispatch,
      type: TimerInstanceTypes.AckTimeout,
      transactionId: task.transactionId,
      taskId: task.taskId,
    });
  }
  return reloadTask(timer.task);
};

export const executor = async () => {
  try {
    const timers: Timer.AllTimerType[] = await poll(consumerTimerClient, 100);
    if (timers.length) {
      await Promise.all(
        timers.map((timer: Timer.AllTimerType) => {
          switch (timer.type) {
            case Timer.TimerTypes.delayTask:
              return handleDelayTimer(timer);

            // Not support cron workflow yet
            case Timer.TimerTypes.cronWorkflow:
            default:
              return Promise.resolve();
          }
        }),
      );
    }
    consumerTimerClient.commit();
  } catch (error) {
    console.log(error);
  } finally {
    setImmediate(executor);
  }
};
