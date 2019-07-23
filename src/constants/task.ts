import * as CommonUtils from '../utils/common';

export enum TaskTypes {
  Task = 'TASK',
  Parallel = 'PARALLEL',
  SubWorkflow = 'SUB_WORKFLOW',
  Decision = 'DECISION',
}

export const TaskTypesList = CommonUtils.enumToList(TaskTypes);

export enum FailureStrategies {
  Failed = 'FAILED',
  RecoveryWorkflow = 'RECOVERY_WORKFLOW',
  Retry = 'RETRY',
  Ignore = 'IGNORE',
}

export const FailureStrategiesList = CommonUtils.enumToList(FailureStrategies);

export enum TaskStates {
  Scheduled = 'SCHEDULED',
  Inprogress = 'INPROGRESS',
  Completed = 'COMPLETED',
  Failed = 'FAILED',
  Timeout = 'TIMEOUT',
}

export const TaskStatesList = CommonUtils.enumToList(FailureStrategies);

export const TaskNextStates = {
  [TaskStates.Scheduled]: [TaskStates.Inprogress, TaskStates.Timeout],
  [TaskStates.Inprogress]: [
    TaskStates.Completed,
    TaskStates.Failed,
    TaskStates.Timeout,
    TaskStates.Inprogress,
  ],
  [TaskStates.Completed]: [],
  [TaskStates.Failed]: [TaskStates.Scheduled],
  [TaskStates.Timeout]: [TaskStates.Scheduled],
};

// https://docs.confluent.io/current/installation/configuration/topic-configs.html
export interface TopicConfigurations {
  'cleanup.policy'?: 'compact' | 'delete';
  'compression.type'?:
    | 'uncompressed'
    | 'zstd'
    | 'lz4'
    | 'snappy'
    | 'gzip'
    | 'producer';
  'delete.retention.ms'?: number;
  'file.delete.delay.ms'?: number;
  'flush.messages'?: number;
  'flush.ms'?: number;
  'follower.replication.throttled.replicas'?: string;
  'index.interval.bytes'?: number;
  'leader.replication.throttled.replicas'?: string;
  'max.message.bytes'?: number;
  'message.format.version'?: string;
  'message.timestamp.difference.max.ms'?: number;
  'message.timestamp.type'?: string;
  'min.cleanable.dirty.ratio'?: number;
  'min.compaction.lag.ms'?: number;
  'min.insync.replicas'?: number;
  preallocate?: boolean;
  'retention.bytes'?: number;
  'retention.ms'?: number;
  'segment.bytes'?: number;
  'segment.index.bytes'?: number;
  'segment.jitter.ms'?: number;
  'segment.ms'?: number;
  'unclean.leader.election.enable'?: boolean;
  'message.downconversion.enable'?: boolean;
}

export interface TaskDefinition {
  name: string;
  description?: string;
  partitionsCount?: number;
  topicConfigurations?: TopicConfigurations;
  responseTimeoutSecond?: number;
  timeoutSecond?: number;
  timeoutStrategy?: FailureStrategies;
  failureStrategy?: FailureStrategies;
  retry?: {
    limit: number;
    delaySecond: number;
  };
  recoveryWorkflow?: {
    name: string;
    rev: number;
  };
}

export interface Task {
  taskName: string;
  taskReferenceNames: string;
  taskId: string;
  workflowId: string;
  status: TaskStates;
  retryCount: number;
  input: {
    [key: string]: any;
  };
  output: any;
  createTime: number; // time that push into Kafka
  startTime: number; // time that worker ack
  endTime: number; // time that task finish/failed/cancel
  logs?: any[];
}

export interface TaskUpdate {
  taskId: string;
  status: TaskStates;
  output?: any;
  logs?: any[] | any;
}
