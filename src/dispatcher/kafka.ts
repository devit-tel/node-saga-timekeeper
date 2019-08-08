import { Producer } from 'node-rdkafka';
import { IDispatcher } from '../dispatcher';
import { Task } from '../task';

// https://github.com/edenhill/librdkafka/blob/master/CONFIGURATION.md
const DEFAULT_PRODUCER_CONF = {
  'client.id': 'SAGA_PM',
  'bootstrap.servers': 'localhost:9092',
  'compression.type': 'snappy',
  'retry.backoff.ms': 100,
  'enable.idempotence': true,
  'message.send.max.retries': 10000000,
  'socket.keepalive.enable': true,
  'queue.buffering.max.messages': 10000,
  'queue.buffering.max.ms': 100,
  'batch.num.messages': 100000,
  'delivery.report.only.error': true,
  dr_cb: true,
};

const DEFAULT_PRODUCER_TOPIC_CONFIG = {
  acks: -1,
  'compression.type': 'snappy',
};

export class KafkaDispatcher implements IDispatcher {
  private client: Producer;
  constructor(
    overidePruducerConf?: { [key: string]: any },
    overidePruducerTopicConf?: { [key: string]: any },
  ) {
    this.client = new Producer(
      { ...DEFAULT_PRODUCER_CONF, ...overidePruducerConf },
      { ...DEFAULT_PRODUCER_TOPIC_CONFIG, ...overidePruducerTopicConf },
    );
    this.client.connect();

    this.client.on('error', console.log);
    this.client.on('ready', () => console.log('ready'));
  }
  dispatch(taskName: string, task: Task) {
    this.client.produce(
      `TASK_${taskName}`,
      null,
      JSON.stringify(task),
      task.workflowId,
      Date.now(),
    );
  }
}
