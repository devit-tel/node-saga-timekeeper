import { systemConsumerClient, poll, dispatch } from './kafka';
import { TaskFromWorkflow, ITask, Task } from './task';
import { AllTaskType } from './workflowDefinition';
import { TaskTypes } from './constants/task';
import { startWorkflow } from './domains/workflow';

const processDecisionTask = async (task: ITask) => {
  // Check condition
  dispatch(new TaskFromWorkflow(task.workflowId, task.defaultDecision[0], {}));
};

const processParallelTask = async (task: ITask) =>
  Promise.all(
    task.parallelTasks.map((pTasks: AllTaskType[]) =>
      dispatch(new TaskFromWorkflow(task.workflowId, pTasks[0], {})),
    ),
  );

const processSubWorkflowTask = async (task: ITask) => {
  await startWorkflow(task.workflow.name, task.workflow.rev, {});
};

export const executor = async () => {
  try {
    const tasks: ITask[] = await poll(systemConsumerClient);
    for (const taskI of tasks) {
      const task = new Task(taskI);
      switch (task.type) {
        case TaskTypes.Decision:
          await processDecisionTask(task);
          break;
        case TaskTypes.Parallel:
          await processParallelTask(task);
          break;
        case TaskTypes.SubWorkflow:
          await processSubWorkflowTask(task);
          break;
        default:
          throw new Error(`Task: ${task.type} is not system task`);
      }
    }
    systemConsumerClient.commit();
  } catch (error) {
    // Handle error here
    console.log(error);
  }
  setImmediate(executor);
};
