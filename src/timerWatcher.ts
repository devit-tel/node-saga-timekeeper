import { Timer } from '@melonade/melonade-declaration';
import {
  consumerTimerClient,
  delayTimer,
  poll,
  reloadTask,
  TimerInstanceTypes,
} from './kafka';

const handleDelayTimer = async (timer: Timer.IDelayTaskTimer) => {
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
