import { State } from '@melonade/melonade-declaration';
import { reloadTask, updateTask } from './kafka';
import { timerInstanceStore } from './store';

const handleTimeoutTask = async (taskId: string, status: State.TaskStates) => {
  const timerData = await timerInstanceStore.get(taskId);
  try {
    updateTask({
      taskId: timerData.task.taskId,
      transactionId: timerData.task.transactionId,
      status,
      isSystem: true,
    });
    await timerInstanceStore.update({
      taskId: timerData.task.taskId,
      delay: false,
      ackTimeout: true,
      timeout: true,
    });
    console.log(
      'send timeout task',
      timerData.task.taskId,
      timerData.task.transactionId,
    );
  } catch (error) {
    // Sometime Event's topic consume faster than Tasks's topic
    // And task already finished but Timekeeper just picked up messages from Tasks's topic
    // So it make false timeout
    console.log(taskId, status, timerData, error);
  }
};

const handleDelayTask = async (taskId: string) => {
  const timerData = await timerInstanceStore.get(taskId);
  reloadTask(timerData.task);
  await timerInstanceStore.update({
    taskId: timerData.task.taskId,
    delay: true,
    ackTimeout: false,
    timeout: false,
  });
  console.log('send delay task');
};

export const executor = () => {
  timerInstanceStore.on('ACK_TIMEOUT', (taskId: string) => {
    handleTimeoutTask(taskId, State.TaskStates.AckTimeOut);
  });
  timerInstanceStore.on('TIMEOUT', (taskId: string) => {
    handleTimeoutTask(taskId, State.TaskStates.Timeout);
  });
  timerInstanceStore.on('DELAY', (taskId: string) => {
    handleDelayTask(taskId);
  });
};
