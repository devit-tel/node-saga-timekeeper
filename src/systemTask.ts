import { systemConsumerClient, poll, dispatch } from './kafka';
import { Task, ITask } from './task';
import { AllTaskType } from './workflowDefinition';
import { TaskTypes } from './constants/task';
import { startWorkflow } from './domains/workflow';

const processDecisionTask = async (task: ITask) => {
  // Check condition
  dispatch(new Task(task.workflowId, task.defaultDecision[0], {}));
};

const processParallelTask = async (task: ITask) => {
  task.parallelTasks.map((pTasks: AllTaskType[]) =>
    dispatch(new Task(task.workflowId, pTasks[0], {})),
  );
};

const processSubWorkflowTask = async (task: ITask) => {
  await startWorkflow(task.workflow.name, task.workflow.rev, {});
};

export const executor = async () => {
  const tasks: ITask[] = await poll(systemConsumerClient);
  for (const task of tasks) {
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
};
