import { Command, Event, Kafka, Task } from '@melonade/melonade-declaration';
import { AdminClient, KafkaConsumer, Producer } from 'node-rdkafka';
import * as config from '../config';
import { jsonTryParse } from '../utils/common';

export const adminClient = AdminClient.create(config.kafkaAdminConfig);

export const consumerTasksClient = new KafkaConsumer(
  config.kafkaTaskWatcherConfig.config,
  config.kafkaTaskWatcherConfig.topic,
);

export const consumerEventsClient = new KafkaConsumer(
  config.kafkaTaskWatcherConfig.config,
  config.kafkaTaskWatcherConfig.topic,
);

export const consumerTimerClient = new KafkaConsumer(
  config.kafkaTaskWatcherConfig.config,
  config.kafkaTaskWatcherConfig.topic,
);

export const producerClient = new Producer(
  config.kafkaProducerConfig.config,
  config.kafkaProducerConfig.topic,
);

consumerTasksClient.setDefaultConsumeTimeout(5);
consumerTasksClient.connect();
consumerTasksClient.on('ready', () => {
  console.log('Consumer Tasks kafka are ready');
  consumerTasksClient.subscribe([
    // Internal lib already support Regexp
    new RegExp(`^${config.kafkaTopicName.task}.*`) as any,
  ]);
});

consumerEventsClient.setDefaultConsumeTimeout(5);
consumerEventsClient.connect();
consumerEventsClient.on('ready', async () => {
  console.log('Consumer Event kafka are ready');
  try {
    await createTopic(config.kafkaTopicName.event, 20, 1);
  } catch (error) {
    console.warn(
      `Create topic "${
        config.kafkaTopicName.event
      }" error: ${error.toString()}`,
    );
  } finally {
    consumerEventsClient.subscribe([config.kafkaTopicName.event]);
  }
});

consumerTimerClient.setDefaultConsumeTimeout(5);
consumerTimerClient.connect();
consumerTimerClient.on('ready', async () => {
  console.log('Consumer Timer kafka are ready');
  try {
    await createTopic(config.kafkaTopicName.event, 20, 1);
  } catch (error) {
    console.warn(
      `Create topic "${
        config.kafkaTopicName.timer
      }" error: ${error.toString()}`,
    );
  } finally {
    consumerTimerClient.subscribe([config.kafkaTopicName.timer]);
  }
});

producerClient.connect();
producerClient.setPollInterval(100);
producerClient.on('ready', () => {
  console.log('Producer kafka are ready');
});

export const createTopic = (
  tipicName: string,
  numPartitions: number = 10,
  replicationFactor: number = 1,
  config?: any,
): Promise<any> =>
  new Promise((resolve: Function, reject: Function) => {
    adminClient.createTopic(
      {
        topic: tipicName,
        num_partitions: numPartitions,
        replication_factor: replicationFactor,
        config: {
          'cleanup.policy': 'compact',
          'compression.type': 'snappy',
          'delete.retention.ms': '86400000',
          'file.delete.delay.ms': '60000',
          ...config,
        },
      },
      (error: Error, data: any) => {
        if (error) return reject(error);
        resolve(data);
      },
    );
  });

export const poll = (
  consumer: KafkaConsumer,
  messageNumber: number = 100,
): Promise<any[]> =>
  new Promise((resolve: Function, reject: Function) => {
    consumer.consume(
      messageNumber,
      (error: Error, messages: Kafka.kafkaConsumerMessage[]) => {
        if (error) return reject(error);
        resolve(
          messages.map((message: Kafka.kafkaConsumerMessage) =>
            jsonTryParse(message.value.toString(), {}),
          ),
        );
      },
    );
  });

export const updateTask = (taskUpdate: Event.ITaskUpdate) =>
  producerClient.produce(
    config.kafkaTopicName.event,
    null,
    Buffer.from(JSON.stringify(taskUpdate)),
    taskUpdate.transactionId,
    Date.now(),
  );

export const reloadTask = (task: Task.ITask) =>
  producerClient.produce(
    config.kafkaTopicName.command,
    null,
    Buffer.from(
      JSON.stringify(<Command.IReloadTaskCommand>{
        type: Command.CommandTypes.ReloadTask,
        transactionId: task.transactionId,
        task,
      }),
    ),
    task.transactionId,
    Date.now(),
  );
