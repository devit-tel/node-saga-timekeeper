import { KafkaConsumer, Producer } from 'node-rdkafka';
import * as config from '../config';
import { jsonTryParse } from '../utils/common';
import { TaskStates } from '../constants/task';
import { ITask } from '../task';

export interface kafkaConsumerMessage {
  value: Buffer;
  size: number;
  key: string;
  topic: string;
  offset: number;
  partition: number;
}

export interface IEvent {
  transactionId: string;
  type: 'TRANSACTION' | 'WORKFLOW' | 'TASK' | 'SYSTEM';
  details?: ITask;
  timestamp: number;
  isError: boolean;
  error?: string;
}

export interface ITaskUpdate {
  transactionId: string;
  taskId: string;
  status: TaskStates;
  output?: any;
  logs?: any[] | any;
  isSystem: boolean;
}

export const consumerTimerClient = new KafkaConsumer(
  config.kafkaTaskWatcherConfig.config,
  config.kafkaTaskWatcherConfig.topic,
);

export const producerClient = new Producer(
  config.kafkaProducerConfig.config,
  config.kafkaProducerConfig.topic,
);

consumerTimerClient.setDefaultConsumeTimeout(1);
consumerTimerClient.connect();
consumerTimerClient.on('ready', () => {
  console.log('Consumer kafka are ready');
  consumerTimerClient.subscribe([config.kafkaTopicName.store]);
});

producerClient.connect();
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

export const updateTask = (taskUpdate: ITaskUpdate) =>
  producerClient.produce(
    config.kafkaTopicName.event,
    null,
    new Buffer(JSON.stringify(taskUpdate)),
    taskUpdate.transactionId,
    Date.now(),
  );

export const dispatch = (task: ITask) =>
  producerClient.produce(
    config.kafkaTopicName.systemTask,
    null,
    new Buffer(JSON.stringify(task)),
    task.transactionId,
    Date.now(),
  );
