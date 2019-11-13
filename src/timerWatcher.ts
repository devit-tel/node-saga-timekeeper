import { Timer } from '@melonade/melonade-declaration';
import { consumerTimerClient, poll, reloadTask } from './kafka';
import { timerInstanceStore } from './store';

const handleDelayTimers = async (timers: Timer.AllTimerType[]) => {
  const delayTimers: Timer.AllTimerType[] = timers.filter(
    (timer: Timer.AllTimerType) => timer.type === Timer.TimerType.delayTask,
  );

  return Promise.all(
    delayTimers.map((delayTimer: Timer.IDelayTaskTimer) => {
      const beforeDispatch =
        delayTimer.task.retryDelay + delayTimer.task.endTime - Date.now();
      if (beforeDispatch > 0) {
        return timerInstanceStore.create({
          task: delayTimer.task,
          ackTimeout: 0,
          timeout: 0,
          delay:
            delayTimer.task.retryDelay + delayTimer.task.endTime - Date.now(),
        });
      }
      return reloadTask(delayTimer.task);
    }),
  );
};

export const executor = async () => {
  try {
    const timers: Timer.AllTimerType[] = await poll(consumerTimerClient, 100);
    if (timers.length) {
      await handleDelayTimers(timers);
    }
    consumerTimerClient.commit();
  } catch (error) {
    console.log(error);
  } finally {
    setImmediate(executor);
  }
};
