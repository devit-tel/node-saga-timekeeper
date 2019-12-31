import { State } from '@melonade/melonade-declaration';
import * as config from './config';
import {
  AllTimerEvents,
  consumerDelaysClients,
  delayTimer,
  ITimerAcktimeoutEvent,
  ITimerDelayEvent,
  ITimerTimeoutEvent,
  poll,
  reloadTask,
  TimerInstanceTypes,
  updateTask,
} from './kafka';
import { timerInstanceStore } from './store';

const handleAckTimeoutTask = async (timer: ITimerAcktimeoutEvent) => {
  updateTask({
    taskId: timer.taskId,
    transactionId: timer.transactionId,
    status: State.TaskStates.AckTimeOut,
    isSystem: true,
  });
};

const handleTimeoutTask = async (timer: ITimerTimeoutEvent) => {
  updateTask({
    taskId: timer.taskId,
    transactionId: timer.transactionId,
    status: State.TaskStates.Timeout,
    isSystem: true,
  });
};

const handleDelayTask = async (timer: ITimerDelayEvent) => {
  const timerData = await timerInstanceStore.get(timer.timerId);
  if (timerData) {
    reloadTask(timerData.task);
    await timerInstanceStore.delete(timer.timerId);
  }
};

const handleDelayTimers = async (timerEvents: AllTimerEvents[]) => {
  for (const timerEvent of timerEvents) {
    const timeBeforeSchedule = timerEvent.scheduledAt - Date.now();
    if (timeBeforeSchedule < 0) {
      switch (timerEvent.type) {
        case TimerInstanceTypes.AckTimeout:
          await handleAckTimeoutTask(timerEvent);
          break;
        case TimerInstanceTypes.Timeout:
          handleTimeoutTask(timerEvent);
          break;
        case TimerInstanceTypes.Delay:
          handleDelayTask(timerEvent);
          break;
      }
    } else {
      delayTimer(timerEvent);
    }
  }
};

const executor = async (delayNumber: number) => {
  const startTime = Date.now();
  const delayConsumer = consumerDelaysClients[delayNumber];
  try {
    const timerEvents: AllTimerEvents[] = await poll(delayConsumer, 100);
    if (timerEvents.length) {
      await handleDelayTimers(timerEvents);
      delayConsumer.commit();
    }
  } catch (error) {
    console.log(error, config.DELAY_TOPIC_STATES[delayNumber]);
  } finally {
    const timeUsed = Date.now() - startTime;
    const waitTime = Math.max(
      config.DELAY_TOPIC_STATES[delayNumber] - timeUsed,
      0,
    );

    setTimeout(() => executor(delayNumber), waitTime);
  }
};

export const executors = () =>
  config.DELAY_TOPIC_STATES.map((_delay, index) => executor(index));
