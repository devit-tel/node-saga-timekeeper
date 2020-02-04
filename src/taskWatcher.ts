import { State, Task } from '@melonade/melonade-declaration';
import {
  consumerTasksClient,
  delayTimer,
  poll,
  TimerInstanceTypes,
  updateTask,
} from './kafka';
import { sleep } from './utils/common';

const handleScheduleTask = (tasks: Task.ITask[]) => {
  const scheduleTasks = tasks.filter(
    (task: Task.ITask) => task.status === State.TaskStates.Scheduled,
  );
  scheduleTasks.map((task: Task.ITask) => {
    const whenAckTimeout = task.ackTimeout + task.startTime;
    const whenTimeout = task.timeout + task.startTime;
    const beforeAckTimeout = whenAckTimeout - Date.now();
    const beforeTimeout = whenTimeout - Date.now();
    if (task.ackTimeout > 0 && beforeAckTimeout < 0) {
      // Task already acktimeout
      updateTask({
        taskId: task.taskId,
        transactionId: task.transactionId,
        isSystem: true,
        status: State.TaskStates.AckTimeOut,
      });
    } else if (task.timeout > 0 && beforeTimeout < 0) {
      // Task already timeout
      updateTask({
        taskId: task.taskId,
        transactionId: task.transactionId,
        isSystem: true,
        status: State.TaskStates.Timeout,
      });
    } else if (task.ackTimeout > 0 || task.timeout > 0) {
      if (task.ackTimeout > 0) {
        delayTimer({
          scheduledAt: whenAckTimeout,
          type: TimerInstanceTypes.AckTimeout,
          transactionId: task.transactionId,
          taskId: task.taskId,
        });
      }
      if (task.timeout) {
        delayTimer({
          scheduledAt: whenTimeout,
          type: TimerInstanceTypes.Timeout,
          transactionId: task.transactionId,
          taskId: task.taskId,
        });
      }
    }
  });
};

export const executor = async () => {
  try {
    const tasks: Task.ITask[] = await poll(consumerTasksClient, 100);

    handleScheduleTask(
      tasks.filter((task: Task.ITask) => {
        return (
          task.type === Task.TaskTypes.Task &&
          (task.ackTimeout > 0 || task.timeout > 0)
        );
      }),
    );

    consumerTasksClient.commit();
  } catch (error) {
    console.warn(error);
    await sleep(1000);
  } finally {
    setImmediate(executor);
  }
};
