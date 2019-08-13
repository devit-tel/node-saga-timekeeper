import { AdminClient, KafkaConsumer, Producer } from 'node-rdkafka';
import { kafkaAdmin, kafkaConsumer, kafkaProducer } from '../config';
import { jsonTryParse } from '../utils/common';
import { Task } from '../task';

export interface kafkaConsumerMessage {
  value: Buffer;
  size: number;
  key: string;
  topic: string;
  offset: number;
  partition: number;
}

export const adminClient = AdminClient.create(kafkaAdmin);
export const consumerClient = new KafkaConsumer(kafkaConsumer, {});
export const producerClient = new Producer(kafkaProducer, {});

consumerClient.connect();
consumerClient.on('ready', () => {
  console.log('Consumer kafka are ready');
  consumerClient.subscribe(['pm-event']);
});

producerClient.connect();
producerClient.on('ready', () => {
  console.log('Producer kafka are ready');
});

export const createTopic = (
  topicName: string,
  topicConfig: object = {},
): Promise<any> =>
  new Promise((resolve: Function, reject: Function) => {
    adminClient.createTopic(
      {
        topic: topicName,
        num_partitions: 10,
        replication_factor: 1,
        config: topicConfig,
      },
      (error: Error, data: any) => {
        if (error) return reject(error);
        resolve(data);
      },
    );
  });

export const poll = (messageNumber?: number): Promise<[any, Function]> =>
  new Promise((resolve: Function, reject: Function) => {
    consumerClient.consume(
      messageNumber,
      (error: Error, messages: kafkaConsumerMessage[]) => {
        if (error) return reject(error);
        resolve([
          messages.map((message: kafkaConsumerMessage) =>
            jsonTryParse(message.value.toString(), {}),
          ),
          consumerClient.commit,
        ]);
      },
    );
  });

export const dispatch = (task: Task) =>
  producerClient.produce(
    `TASK_${task.taskName}`,
    null,
    new Buffer(task.toJSON()),
    task.workflowId,
    Date.now(),
  );
