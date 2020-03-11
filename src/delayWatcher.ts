import { State } from '@melonade/melonade-declaration';
import * as config from './config';
import {
  AllTimerEvents,
  consumerDelaysClients,
  delayTimer,
  ITimerAcktimeoutEvent,
  ITimerCompleteEvent,
  ITimerDelayEvent,
  ITimerTimeoutEvent,
  poll,
  reloadTask,
  TimerInstanceTypes,
  updateTask,
} from './kafka';
import { sleep } from './utils/common';

const handleAckTimeoutTask = (timer: ITimerAcktimeoutEvent) => {
  updateTask({
    taskId: timer.taskId,
    transactionId: timer.transactionId,
    status: State.TaskStates.AckTimeOut,
    isSystem: true,
  });
};

const handleTimeoutTask = (timer: ITimerTimeoutEvent) => {
  updateTask({
    taskId: timer.taskId,
    transactionId: timer.transactionId,
    status: State.TaskStates.Timeout,
    isSystem: true,
  });
};

const handleDelayTask = (timer: ITimerDelayEvent) => {
  reloadTask(timer.task);
};

const handleCompleteTask = (timer: ITimerCompleteEvent) => {
  updateTask({
    taskId: timer.taskId,
    transactionId: timer.transactionId,
    status: State.TaskStates.Completed,
    isSystem: true,
  });
};

const handleDelayTimers = (timerEvents: AllTimerEvents[]) => {
  for (const timerEvent of timerEvents) {
    const timeBeforeSchedule = timerEvent.scheduledAt - Date.now();

    if (timeBeforeSchedule <= 0) {
      switch (timerEvent.type) {
        case TimerInstanceTypes.AckTimeout:
          handleAckTimeoutTask(timerEvent);
          break;
        case TimerInstanceTypes.Timeout:
          handleTimeoutTask(timerEvent);
          break;
        case TimerInstanceTypes.Delay:
          handleDelayTask(timerEvent);
          break;
        case TimerInstanceTypes.Complete:
          handleCompleteTask(timerEvent);
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
      handleDelayTimers(timerEvents);
      delayConsumer.commit();
    }
  } catch (error) {
    await sleep(1000);
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
