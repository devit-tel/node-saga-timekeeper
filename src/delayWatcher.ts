import { State } from '@melonade/melonade-declaration';
import * as R from 'ramda';
import * as config from './config';
import {
  consumerDelaysClients,
  consumerTimerClient,
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

const handleTimeoutTask = async (timerId: string, status: State.TaskStates) => {
  const timerData = await timerInstanceStore.get(timerId);

  // Check if timer was cancelled
  if (
    (status === State.TaskStates.AckTimeOut && timerData.ackTimeout) ||
    (status === State.TaskStates.Timeout && timerData.timeout)
  ) {
    await timerInstanceStore.update({
      timerId,
      delay: false,
      ackTimeout: true,
      timeout: true,
    });
    updateTask({
      taskId: timerData.task.taskId,
      transactionId: timerData.task.transactionId,
      status,
      isSystem: true,
    });
    console.log(
      'send timeout task',
      timerData.task.taskId,
      timerData.task.transactionId,
    );
  } else {
    // Sometime Event's topic consume faster than Tasks's topic
    // And task already finished but Timekeeper just picked up messages from Tasks's topic
    // So it make false timeout
    console.log(timerId, status, timerData);
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
                await handleTimeoutTask(
                  timerEvent.timerId,
                  State.TaskStates.AckTimeOut,
                );
                break;
              case TimerType.Timeout:
                await handleTimeoutTask(
                  timerEvent.timerId,
                  State.TaskStates.Timeout,
                );
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
  const delayConsumer = consumerDelaysClients[delayNumber];
  try {
    const timerEvents: ITimerEvent[] = await poll(delayConsumer, 100);
    if (timerEvents.length) {
      await handleDelayTimers(timerEvents);
    }
    consumerTimerClient.commit();
  } catch (error) {
    console.log(error);
  } finally {
    setTimeout(
      () => executor(delayNumber),
      config.DELAY_TOPIC_STATES[delayNumber],
    );
  }
};

export const executors = () =>
  config.DELAY_TOPIC_STATES.map((_delay, index) => executor(index));
