import { AdminClient } from 'node-rdkafka';
import { kafkaAdmin } from '../config';

export const adminClient = AdminClient.create(kafkaAdmin);

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
