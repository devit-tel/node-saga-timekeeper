export enum TaskTypes {
  Task = 'TASK',
  Parallel = 'PARALLEL',
  SubWorkflow = 'SUB_WORKFLOW',
  Decision = 'DECISION',
}

export enum FailureStrategies {
  Failed = 'FAILED',
  RecoveryWorkflow = 'RECOVERY_WORKFLOW',
  Retry = 'RETRY',
  Ignore = 'IGNORE',
}

export enum TaskStates {
  Scheduled = 'SCHEDULED',
  Completed = 'COMPLETED',
  Failed = 'FAILED',
  Timeout = 'TIMEOUT',
  Inprogress = 'INPROGRESS',
}

export const TaskScheduledNextStates = [
  TaskStates.Inprogress,
  TaskStates.Timeout,
];
export const TaskCompletedNextStates = [];
export const TaskFailedNextStates = [TaskStates.Scheduled];
export const TaskTimeoutNextStates = [TaskStates.Scheduled];
export const TaskInprogressNextStates = [
  TaskStates.Completed,
  TaskStates.Failed,
  TaskStates.Timeout,
  TaskStates.Inprogress,
];

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
