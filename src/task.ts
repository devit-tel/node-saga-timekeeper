import * as R from 'ramda';
import * as uuid from 'uuid/v4';
import * as TaskC from './constants/task';
import * as WorkflowC from './constants/workflow';
import * as CommonUtils from './utils/common';

const defaultTopicConfigurations = {
  'cleanup.policy': 'compact',
  'compression.type': 'snappy',
  'delete.retention.ms': 86400000,
  'file.delete.delay.ms': 60000,
};

const isNumber = R.is(Number);
const isString = R.is(String);

const isRecoveryWorkflowConfigValid = (
  taskDefinition: TaskC.TaskDefinition,
): boolean =>
  (taskDefinition.timeoutStrategy ===
    TaskC.FailureStrategies.RecoveryWorkflow ||
    taskDefinition.failureStrategy ===
      TaskC.FailureStrategies.RecoveryWorkflow) &&
  (!isString(R.path(['recoveryWorkflow', 'name'], taskDefinition)) ||
    !isNumber(R.path(['recoveryWorkflow', 'rev'], taskDefinition)));

const isFailureStrategiesConfigValid = (
  taskDefinition: TaskC.TaskDefinition,
): boolean =>
  (taskDefinition.timeoutStrategy === TaskC.FailureStrategies.Retry ||
    taskDefinition.failureStrategy === TaskC.FailureStrategies.Retry) &&
  (!isNumber(R.path(['retry', 'limit'], taskDefinition)) ||
    !isNumber(R.path(['retry', 'delaySecond'], taskDefinition)));

const taskValidation = (taskDefinition: TaskC.TaskDefinition): string[] => {
  const errors = [];
  if (!CommonUtils.isValidName(taskDefinition.name))
    errors.push('taskDefinition.name is invalid');

  if (isRecoveryWorkflowConfigValid(taskDefinition))
    errors.push('taskDefinition.recoveryWorkflow is invalid');

  if (isFailureStrategiesConfigValid(taskDefinition))
    errors.push('taskDefinition.retry is invalid');

  return errors;
};

export class TaskDefinition implements TaskC.TaskDefinition {
  name: string;
  description: string = 'No description';
  partitionsCount: number = 10;
  topicConfigurations: TaskC.TopicConfigurations = {};
  responseTimeoutSecond: number = 5;
  timeoutSecond: number = 30;
  timeoutStrategy: TaskC.FailureStrategies = TaskC.FailureStrategies.Failed;
  failureStrategy: TaskC.FailureStrategies = TaskC.FailureStrategies.Failed;
  inputParameters: {
    [key: string]: any;
  } = {};

  constructor(taskDefinition: TaskC.TaskDefinition) {
    const taskValidationErrors = taskValidation(taskDefinition);

    if (taskValidationErrors.length)
      throw new Error(taskValidationErrors.join('\n'));

    Object.assign(this, taskDefinition);
    this.topicConfigurations = Object.assign(
      defaultTopicConfigurations,
      taskDefinition.topicConfigurations,
    );
  }
}

export class Task implements TaskC.Task {
  taskName: string;
  taskReferenceNames: string;
  taskId: string;
  workflowId: string;
  status: TaskC.TaskStates;
  retryCount: number;
  input: {
    [key: string]: any;
  };
  output: any;
  createTime: number; // time that push into Kafka
  startTime: number; // time that worker ack
  endTime: number; // time that task finish/failed/cancel
  logs?: any[];

  constructor(
    workflowId: string,
    task: WorkflowC.AllTaskType,
    tasksData: { [taskReferenceName: string]: TaskC.Task },
  ) {
    this.taskName = task.name;
    this.taskReferenceNames = task.taskReferenceName;
    this.taskId = uuid();
    this.workflowId = workflowId;
    this.status = TaskC.TaskStates.Scheduled;
    this.retryCount = 0;
    // TODO inject input later
    this.input = tasksData;
    this.output = {};
    this.createTime = Date.now();
    this.startTime = null;
    this.endTime = null;
    this.logs = [];
  }

  dispatch() {
    // Dispatch command to worker
  }
}
