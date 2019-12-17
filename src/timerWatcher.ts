import { Timer } from '@melonade/melonade-declaration';
import { consumerTimerClient, poll, reloadTask } from './kafka';
import { timerInstanceStore } from './store';

const handleDelayTimer = async (timer: Timer.IDelayTaskTimer) => {
  const whenDispatch = timer.task.retryDelay + timer.task.endTime;
  const beforeDispatch = whenDispatch - Date.now();
  console.log('register delay');
  if (beforeDispatch > 0) {
    return timerInstanceStore.create({
      task: timer.task,
      ackTimeout: 0,
      timeout: 0,
      delay: whenDispatch,
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
            case Timer.TimerType.delayTask:
              return handleDelayTimer(timer);

            // Not support cron workflow yet
            case Timer.TimerType.cronWorkflow:
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
