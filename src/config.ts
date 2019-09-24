import * as dotenv from 'dotenv';
import * as kafkaConstant from './constants/kafka';

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

export const saga = {
  namespace: process.env['saga.namespace'] || 'node',
};

export const kafkaTopicName = {
  // Publish to specified task
  task: `${saga.namespace}.${kafkaConstant.PREFIX}.${kafkaConstant.TASK_TOPIC_NAME}`,
  // Publish to system task
  systemTask: `${saga.namespace}.${kafkaConstant.PREFIX}.${kafkaConstant.SYSTEM_TASK_TOPIC_NAME}`,
  // Publish to store event
  store: `${saga.namespace}.${kafkaConstant.PREFIX}.${kafkaConstant.STORE_TOPIC_NAME}`,
  // Subscriptions to update event
  event: `${saga.namespace}.${kafkaConstant.PREFIX}.${kafkaConstant.EVENT_TOPIC}`,
};

export const kafkaTaskWatcherConfig = {
  config: {
    'enable.auto.commit': 'false',
    'group.id': `saga-${saga.namespace}-task-watcher`,
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
      dbName: `saga-pm-${saga.namespace}`,
      useNewUrlParser: true,
      useCreateIndex: true,
      reconnectTries: Number.MAX_SAFE_INTEGER,
      poolSize: 100,
      useFindAndModify: false,
    },
  },
};
