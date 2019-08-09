import * as dotenv from 'dotenv';
import { DispatcherType } from './dispatcher';
import { StoreType } from './store';

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

export const server = {
  enabled: process.env['server.enabled'] === 'true',
  port: +process.env['server.port'] || 8080,
  hostname: process.env['server.hostname'] || '127.0.0.1',
};

export const kafkaAdmin = {
  'client.id': 'saga-pm',
  ...pickAndReplaceFromENV('^admin\\.kafka\\.conf\\.'),
};

export const kafkaConsumer = {
  'client.id': 'saga-pm',
  'enable.auto.commit': 'false',
  'group.id': 'saga-pm-consumer',
  ...pickAndReplaceFromENV('^consumer\\.kafka\\.conf\\.'),
};

export const dispatcher = {
  type: DispatcherType.Kafka,
  kafkaConfig: {
    overideProducerConf: {
      'client.id': 'saga-pm',
      ...pickAndReplaceFromENV('^dispatcher\\.kafka\\.conf\\.'),
    },
    overideProducerTopicConf: pickAndReplaceFromENV(
      '^dispatcher\\.kafka\\.topicconf\\.',
    ),
  },
};

export const taskDefinitionStore = {
  type: StoreType.ZooKeeper,
  zookeeperConfig: {
    root: '/saga-pm/task-definition',
    connectionString: process.env['task-definition.connections'],
    options: {
      sessionTimeout: 30000,
      spinDelay: 1000,
      retries: 0,
    },
  },
};

export const workflowDefinitionStore = {
  type: StoreType.ZooKeeper,
  zookeeperConfig: {
    root: '/saga-pm/workflow-definition',
    connectionString: process.env['workflow-definition.connections'],
    options: {
      sessionTimeout: 30000,
      spinDelay: 1000,
      retries: 0,
    },
  },
};
