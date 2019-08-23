import { systemConsumerClient, poll, dispatch, sendEvent } from './kafka';
import { TaskFromWorkflow, ITask, Task } from './task';
import { AllTaskType } from './workflowDefinition';
import { TaskTypes, TaskStates } from './constants/task';
import { startWorkflow } from './domains/workflow';
import { getTaskData, processTask } from './state';
import { Workflow } from './workflow';
import { workflowInstanceStore, taskInstanceStore } from './store';
import { mapInputFromTaskData } from './utils/task';

// TODO watch for sub-tasks are completed

const processDecisionTask = async (systemTask: Task) => {
  const workflow: Workflow = await workflowInstanceStore.getValue(
    systemTask.workflowId,
  );
  const taskData = await getTaskData(workflow);
  const taskInputs = mapInputFromTaskData(systemTask, taskData);
  const task = new TaskFromWorkflow(
    systemTask.workflowId,
    systemTask.decisions[taskInputs.case]
      ? systemTask.decisions[taskInputs.case][0]
      : systemTask.defaultDecision[0],
    {
      workflow,
      ...taskData,
    },
    systemTask.taskId,
  );
  workflow.taskRefs[task.taskReferenceName] = task.taskId;
  await dispatch(task);
  await Promise.all([
    taskInstanceStore.setValue(task.taskId, task),
    workflowInstanceStore.setValue(workflow.workflowId, workflow),
  ]);
};

const processParallelTask = async (systemTask: Task) => {
  const workflow: Workflow = await workflowInstanceStore.getValue(
    systemTask.workflowId,
  );
  const taskData = await getTaskData(workflow);
  const tasks = systemTask.parallelTasks.map(
    (pTasks: AllTaskType[]) =>
      new TaskFromWorkflow(
        systemTask.workflowId,
        pTasks[0],
        {
          workflow,
          ...taskData,
        },
        systemTask.taskId,
      ),
  );
  for (const task of tasks) {
    workflow.taskRefs[task.taskReferenceName] = task.taskId;
  }
  await Promise.all(tasks.map((task: Task) => dispatch(task)));
  await Promise.all([
    ...tasks.map((task: Task) => taskInstanceStore.setValue(task.taskId, task)),
    workflowInstanceStore.setValue(workflow.workflowId, workflow),
  ]);
};

const processSubWorkflowTask = (systemTask: Task) =>
  startWorkflow(
    systemTask.workflow.name,
    systemTask.workflow.rev,
    systemTask.input,
    systemTask.taskId,
  );

export const executor = async () => {
  try {
    const tasks: ITask[] = await poll(systemConsumerClient);
    for (const taskI of tasks) {
      const task = new Task(taskI);
      try {
        processTask(task, { status: TaskStates.Inprogress });
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
        await taskInstanceStore.setValue(task.taskId, task);
        sendEvent({
          type: 'TASK',
          status: TaskStates.Inprogress,
          workflowId: task.workflowId,
          timestamp: Date.now(),
          details: task.toObject(),
          isError: false,
        });
      } catch (error) {
        sendEvent({
          type: 'TASK',
          workflowId: task.workflowId,
          timestamp: Date.now(),
          details: task.toObject(),
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
