import { timerInstanceStore } from './store';
import { updateTask, dispatch } from './kafka';
import { State } from '@melonade/melonade-declaration';

const handleTimeoutTask = async (taskId: string) => {
  const timerData = await timerInstanceStore.get(taskId);
  updateTask({
    taskId: timerData.task.taskId,
    transactionId: timerData.task.transactionId,
    status: State.TaskStates.Timeout,
    isSystem: true,
  });
  await timerInstanceStore.delete(timerData.task.taskId);
  console.log('send timeout task');
};

const handleDelayTask = async (taskId: string) => {
  const timerData = await timerInstanceStore.get(taskId);
  dispatch(timerData.task);
  await timerInstanceStore.delete(timerData.task.taskId);
  console.log('send delay task');
};

export const executor = () => {
  timerInstanceStore.watch((type, taskId) => {
    switch (type) {
      case 'TIMEOUT':
        handleTimeoutTask(taskId);
        break;
      case 'DELAY':
        handleDelayTask(taskId);
        break;
    }
  });
};
