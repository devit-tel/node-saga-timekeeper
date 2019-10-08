import { KafkaConsumer, Producer } from '@nv4re/node-rdkafka';
import { Task, Kafka, Event } from '@melonade/melonade-declaration';
import * as config from '../config';
import { jsonTryParse } from '../utils/common';

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
    new RegExp(`^${config.kafkaTopicName.task}.*`),
  ]);
});

consumerEventsClient.setDefaultConsumeTimeout(5);
consumerEventsClient.connect();
consumerEventsClient.on('ready', () => {
  console.log('Consumer Event kafka are ready');
  consumerEventsClient.subscribe([config.kafkaTopicName.event]);
});

consumerTimerClient.setDefaultConsumeTimeout(5);
consumerTimerClient.connect();
consumerTimerClient.on('ready', () => {
  console.log('Consumer Timer kafka are ready');
  consumerTimerClient.subscribe([config.kafkaTopicName.timer]);
});

producerClient.connect();
producerClient.setPollInterval(100);
producerClient.on('ready', () => {
  console.log('Producer kafka are ready');
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

export const dispatch = (task: Task.ITask) =>
  producerClient.produce(
    config.kafkaTopicName.systemTask,
    null,
    Buffer.from(JSON.stringify(task)),
    task.transactionId,
    Date.now(),
  );
