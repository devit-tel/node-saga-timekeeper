import { systemConsumerClient, poll, sendEvent } from './kafka';
import { ITask } from './task';
import { AllTaskType } from './workflowDefinition';
import { TaskTypes, TaskStates } from './constants/task';
import { startWorkflow } from './domains/workflow';
import { getTaskData } from './state';
import { Workflow } from './workflow';
import { workflowInstanceStore, taskInstanceStore } from './store';
import { mapInputFromTaskData } from './utils/task';

// TODO watch for sub-tasks are completed

const processDecisionTask = async (systemTask: ITask) => {
  const workflow: Workflow = await workflowInstanceStore.get(
    systemTask.workflowId,
  );
  const taskData = await getTaskData(workflow);
  const taskInputs = mapInputFromTaskData(systemTask, taskData);

  await taskInstanceStore.create(
    workflow,
    systemTask.decisions[taskInputs.case]
      ? systemTask.decisions[taskInputs.case][0]
      : systemTask.defaultDecision[0],
    taskData,
    true,
  );
};

const processParallelTask = async (systemTask: ITask) => {
  const workflow: Workflow = await workflowInstanceStore.get(
    systemTask.workflowId,
  );
  const taskData = await getTaskData(workflow);
  await Promise.all(
    systemTask.parallelTasks.map((tasks: AllTaskType[]) =>
      taskInstanceStore.create(workflow, tasks[0], taskData, true),
    ),
  );
};

const processSubWorkflowTask = (systemTask: ITask) =>
  startWorkflow(
    systemTask.workflow.name,
    systemTask.workflow.rev,
    systemTask.input,
    systemTask.taskId,
  );

export const executor = async () => {
  try {
    const tasks: ITask[] = await poll(systemConsumerClient);
    for (const task of tasks) {
      try {
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
        await taskInstanceStore.update({
          taskId: task.taskId,
          status: TaskStates.Inprogress,
        });
        sendEvent({
          type: 'TASK',
          status: TaskStates.Inprogress,
          workflowId: task.workflowId,
          timestamp: Date.now(),
          details: task,
          isError: false,
        });
      } catch (error) {
        sendEvent({
          type: 'TASK',
          workflowId: task.workflowId,
          timestamp: Date.now(),
          details: task,
          isError: true,
          error: error.toString(),
        });
      }
    }
    systemConsumerClient.commit();
  } catch (error) {
    // Handle error here
    console.log(error);
  }
  setImmediate(executor);
};
