import * as dotenv from 'dotenv';
import { Kafka } from '@melonade/melonade-declaration';

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
  // Publish to system task
  systemTask: `${prefix}.${Kafka.topicSuffix.systemTask}`,
  // Publish to store event
  store: `${prefix}.${Kafka.topicSuffix.store}`,
  // Subscriptions to update event
  event: `${prefix}.${Kafka.topicSuffix.event}`,
  // Subscriptions to command
  command: `${prefix}.${Kafka.topicSuffix.command}`,
};

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
    'message.send.max.retries': '100000',
    'socket.keepalive.enable': 'true',
    'queue.buffering.max.messages': '10000',
    'queue.buffering.max.ms': '1',
    'batch.num.messages': '100',
    ...pickAndReplaceFromENV('^kafka\\.conf\\.'),
    ...pickAndReplaceFromENV('^producer\\.kafka\\.conf\\.'),
  },
  topic: {
    ...pickAndReplaceFromENV('^kafka\\.topic-confg\\.'),
    ...pickAndReplaceFromENV('^producer\\.kafka\\.topic-confg\\.'),
  },
};

export const timerInstanceStoreConfig = {
  type: process.env['timer-instance.type'],
  mongoDBConfig: {
    uri: process.env['timer-instance.mongodb.uri'],
    options: {
      dbName: `melonade-${melonade.namespace}`,
      useNewUrlParser: true,
      useCreateIndex: true,
      reconnectTries: Number.MAX_SAFE_INTEGER,
      poolSize: 100,
      useFindAndModify: false,
    },
  },
  redisConfig: {
    db: '2',
    ...pickAndReplaceFromENV('^timer-instance\\.redis\\.'),
  },
};
