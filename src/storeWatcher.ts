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
    await timerInstanceStore.delete(timerData.task.taskId);
    console.log(
      'send timeout task',
      timerData.task.taskId,
      timerData.task.transactionId,
    );
  } catch (error) {
    // Sometime handleDelayTask did not delete key and before ttl runout
    // So to make sure it only prob here just log to make sure
    console.log(taskId, timerData, error);
  }
};

const handleDelayTask = async (taskId: string) => {
  const timerData = await timerInstanceStore.get(taskId);
  reloadTask(timerData.task);
  await timerInstanceStore.delete(timerData.task.taskId);
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
