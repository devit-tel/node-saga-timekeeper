import { State } from '@melonade/melonade-declaration';
import * as R from 'ramda';
import * as config from './config';
import {
  consumerDelaysClients,
  delayTimer,
  ITimerEvent,
  poll,
  reloadTask,
  updateTask,
} from './kafka';
import { timerInstanceStore, TimerType } from './store';

const groupByTimerId = R.compose<
  ITimerEvent[],
  { [timerId: string]: ITimerEvent[] },
  ITimerEvent[][]
>(
  R.values,
  R.groupBy(R.propOr('', 'timerId')),
);

const handleAckTimeoutTask = async (timerId: string) => {
  const timerData = await timerInstanceStore.get(timerId);
  // Check if timer was cancelled
  if (R.prop('ackTimeout', timerData)) {
    await timerInstanceStore.update({
      timerId,
      delay: false,
      ackTimeout: true,
      timeout: false,
    });
    updateTask({
      taskId: timerData.task.taskId,
      transactionId: timerData.task.transactionId,
      status: State.TaskStates.AckTimeOut,
      isSystem: true,
    });
    console.log(
      'Send ack timeout task',
      timerData.task.taskId,
      timerData.task.transactionId,
    );
  } else {
    console.log('skip ackTimeout');
  }
};

const handleTimeoutTask = async (timerId: string) => {
  const timerData = await timerInstanceStore.get(timerId);

  // Check if timer was cancelled
  if (R.prop('ackTimeout', timerData)) {
    await timerInstanceStore.update({
      timerId,
      delay: false,
      ackTimeout: true,
      timeout: true,
    });
    updateTask({
      taskId: timerData.task.taskId,
      transactionId: timerData.task.transactionId,
      status: State.TaskStates.Timeout,
      isSystem: true,
    });
    console.log(
      'Send timeout task',
      timerData.task.taskId,
      timerData.task.transactionId,
    );
  } else {
    console.log('skip timeout');
  }
};

const handleDelayTask = async (timerId: string) => {
  const timerData = await timerInstanceStore.get(timerId);
  if (R.prop('delay', timerData)) {
    reloadTask(timerData.task);
    await timerInstanceStore.update({
      timerId: timerData.task.taskId,
      delay: true,
      ackTimeout: false,
      timeout: false,
    });
    console.log('Sent delay task');
  } else {
    console.log('Delay task was cancelled');
  }
};

const handleDelayTimers = async (timerEvents: ITimerEvent[]) => {
  return Promise.all(
    // Run sequntial for same timerId
    groupByTimerId(timerEvents).map(
      async (groupedTimerEvents: ITimerEvent[]) => {
        for (const timerEvent of groupedTimerEvents) {
          const timeBeforeSchedule = timerEvent.scheduledAt - Date.now();
          if (timeBeforeSchedule < 0) {
            switch (timerEvent.type) {
              case TimerType.AckTimeout:
                await handleAckTimeoutTask(timerEvent.timerId);
                break;
              case TimerType.Timeout:
                await handleTimeoutTask(timerEvent.timerId);
                break;
              case TimerType.Delay:
                await handleDelayTask(timerEvent.timerId);
                break;
            }
          } else {
            delayTimer(timerEvent);
          }
        }
      },
    ),
  );
};

const executor = async (delayNumber: number) => {
  const startTime = Date.now();
  const delayConsumer = consumerDelaysClients[delayNumber];
  try {
    const timerEvents: ITimerEvent[] = await poll(delayConsumer, 100);
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
