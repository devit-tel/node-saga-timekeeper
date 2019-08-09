import { AdminClient, KafkaConsumer } from 'node-rdkafka';
import { kafkaAdmin, kafkaConsumer } from '../config';
import { jsonTryParse } from '../utils/common';

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

consumerClient.connect();
consumerClient.on('ready', () => {
  console.log('consumerClient are ready');
  consumerClient.subscribe(['pm-event']);
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

export const poll = (messageNumber?: number) =>
  new Promise((resolve: Function, reject: Function) => {
    consumerClient.consume(
      messageNumber,
      (error: Error, messages: kafkaConsumerMessage[]) => {
        if (error) return reject(error);
        resolve(
          messages.map((message: kafkaConsumerMessage) =>
            jsonTryParse(message.value.toString(), {}),
          ),
        );
      },
    );
  });
