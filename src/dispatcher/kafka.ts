import * as KafkaClient from 'node-rdkafka';
import { IDispatcher } from './';
import * as Task from '../task';

const DEFAULT_PRODUCER_CONF = {
  'client.id': 'kafka',
  'metadata.broker.list': 'localhost:9092',
  'compression.codec': 'gzip',
  'retry.backoff.ms': 200,
  'message.send.max.retries': 10,
  'socket.keepalive.enable': true,
  'queue.buffering.max.messages': 100000,
  'queue.buffering.max.ms': 1000,
  'batch.num.messages': 1000000,
  dr_cb: true,
};

export class KafkaDispatcher implements IDispatcher {
  private client: KafkaClient.Producer;
  constructor(overidePruducerConf: { [key: string]: any }) {
    this.client = new KafkaClient.Producer({
      ...overidePruducerConf,
      ...DEFAULT_PRODUCER_CONF,
    });
    this.client.connect();
  }
  dispatch(taskName: string, task: Task.Task) {
    this.client.produce(
      `TASK_${taskName}`,
      null,
      JSON.stringify(task),
      task.workflowId,
      Date.now(),
    );
  }
}
