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

export const dispatcher = {
  type: DispatcherType.Kafka,
  kafkaConfig: {
    overideProducerConf: pickAndReplaceFromENV('^dispatcher\\.kafka\\.conf\\.'),
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
