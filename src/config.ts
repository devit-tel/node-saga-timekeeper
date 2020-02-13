import { Kafka } from '@melonade/melonade-declaration';
import * as dotenv from 'dotenv';

dotenv.config();
const pickAndReplaceFromENV = (template: string) =>
  Object.keys(process.env).reduce((result: any, key: string) => {
    if (new RegExp(template).test(key)) {
      return {
        ...result,
        [key.replace(new RegExp(template), '')]: process.env[key],
      };
    }
    return result;
  }, {});

export const melonade = {
  namespace: process.env['melonade.namespace'] || 'default',
};

export const prefix = `${Kafka.topicPrefix}.${melonade.namespace}`;

export const kafkaTopicName = {
  // Publish to specified task
  task: `${prefix}.${Kafka.topicSuffix.task}`,
  // Publish to store event
  store: `${prefix}.${Kafka.topicSuffix.store}`,
  // Subscriptions to update event
  event: `${prefix}.${Kafka.topicSuffix.event}`,
  // Subscriptions to command
  command: `${prefix}.${Kafka.topicSuffix.command}`,
  // Timer event (Cron, Delay task)
  timer: `${prefix}.${Kafka.topicSuffix.timer}`,
};

export const kafkaTopic = {
  num_partitions: +process.env['topic.kafka.num_partitions'] || 10,
  replication_factor: +process.env['topic.kafka.replication_factor'] || 1,
};

export const kafkaAdminConfig = {
  ...pickAndReplaceFromENV('^kafka\\.conf\\.'),
  ...pickAndReplaceFromENV('^admin\\.kafka\\.conf\\.'),
};

// This list have to be sorted
export const DELAY_TOPIC_STATES = [
  1000,
  2000,
  5000,
  10000,
  60000,
  300000,
  1800000,
];

export const kafkaTaskWatcherConfig = {
  config: {
    'enable.auto.commit': 'false',
    'group.id': `melonade-${melonade.namespace}-task-watcher`,
    ...pickAndReplaceFromENV('^kafka\\.conf\\.'),
    ...pickAndReplaceFromENV('^task-watcher\\.kafka\\.conf\\.'),
  },
  topic: {
    'auto.offset.reset': 'earliest',
    ...pickAndReplaceFromENV('^kafka\\.topic-conf\\.'),
    ...pickAndReplaceFromENV('^task-watcher\\.kafka\\.topic-conf\\.'),
  },
};

export const kafkaProducerConfig = {
  config: {
    'compression.type': 'snappy',
    'enable.idempotence': 'true',
    retries: '10000000',
    'socket.keepalive.enable': 'true',
    'queue.buffering.max.messages': '100000',
    'queue.buffering.max.ms': '1',
    'batch.num.messages': '10000',
    ...pickAndReplaceFromENV('^kafka\\.conf\\.'),
    ...pickAndReplaceFromENV('^producer\\.kafka\\.conf\\.'),
  },
  topic: {
    acks: 'all',
    ...pickAndReplaceFromENV('^kafka\\.topic-confg\\.'),
    ...pickAndReplaceFromENV('^producer\\.kafka\\.topic-confg\\.'),
  },
};
