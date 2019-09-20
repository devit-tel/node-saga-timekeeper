import * as dotenv from 'dotenv';
import { StoreType } from './constants/store';
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

export const kafkaConsumerTimer = {
  'enable.auto.commit': 'false',
  'group.id': 'saga-pm-consumer-timer',
  ...pickAndReplaceFromENV('^kafka\\.conf\\.'),
  ...pickAndReplaceFromENV('^consumer-timer\\.kafka\\.conf\\.'),
};

export const kafkaProducer = {
  'compression.type': 'snappy',
  'retry.backoff.ms': '100',
  'enable.idempotence': 'true',
  'message.send.max.retries': '100000',
  'socket.keepalive.enable': 'true',
  'queue.buffering.max.messages': '10000',
  'queue.buffering.max.ms': '1',
  'batch.num.messages': '100',
  'delivery.report.only.error': 'true',
  dr_cb: 'true',
  ...pickAndReplaceFromENV('^kafka\\.conf\\.'),
  ...pickAndReplaceFromENV('^producer\\.kafka\\.conf\\.'),
};

export const timerInstanceStore = {
  type: StoreType.MongoDB,
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
