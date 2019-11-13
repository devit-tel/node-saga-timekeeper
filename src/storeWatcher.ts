import { State } from "@melonade/melonade-declaration";
import { reloadTask, updateTask } from "./kafka";
import { timerInstanceStore, timerLeaderStore } from "./store";

const handleTimeoutTask = async (taskId: string, status: State.TaskStates) => {
  const timerData = await timerInstanceStore.get(taskId);
  try {
    updateTask({
      taskId: timerData.task.taskId,
      transactionId: timerData.task.transactionId,
      status,
      isSystem: true
    });
    await timerInstanceStore.delete(timerData.task.taskId);
    console.log(
      "send timeout task",
      timerData.task.taskId,
      timerData.task.transactionId
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
  console.log("send delay task");
};

export const executor = () => {
  timerInstanceStore.watch((type, taskId) => {
    if (timerLeaderStore.isLeader()) {
      switch (type) {
        case "ACK_TIMEOUT":
          handleTimeoutTask(taskId, State.TaskStates.AckTimeOut);
          break;
        case "TIMEOUT":
          handleTimeoutTask(taskId, State.TaskStates.Timeout);
          break;
        case "DELAY":
          handleDelayTask(taskId);
          break;
      }
    }
  });
};
