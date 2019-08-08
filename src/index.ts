import * as config from './config';
import * as dispatcher from './dispatcher';
import { KafkaDispatcher } from './dispatcher/kafka';
import * as store from './store';
import { WorkflowDefinitionZookeeperStore } from './store/zookeeper/workflowDefinition';
import { TeskDefinitionZookeeperStore } from './store/zookeeper/teskDefinition';
import * as server from './server';

switch (config.dispatcher.type) {
  case dispatcher.DispatcherType.Kafka:
    dispatcher.dispatcher.setClient(
      new KafkaDispatcher(
        config.dispatcher.kafkaConfig.overideProducerConf,
        config.dispatcher.kafkaConfig.overideProducerTopicConf,
      ),
    );
    break;
  default:
    throw new Error(`Dispatch: ${config.dispatcher.type} is invalid`);
}

switch (config.workflowDefinitionStore.type) {
  case store.StoreType.ZooKeeper:
    store.workflowDefinitionStore.setClient(
      new WorkflowDefinitionZookeeperStore(
        config.workflowDefinitionStore.zookeeperConfig.root,
        config.workflowDefinitionStore.zookeeperConfig.connectionString,
        config.workflowDefinitionStore.zookeeperConfig.options,
      ),
    );
    break;
  default:
    throw new Error(
      `WorkflowDefinition Store: ${config.workflowDefinitionStore.type} is invalid`,
    );
}

switch (config.taskDefinitionStore.type) {
  case store.StoreType.ZooKeeper:
    store.taskDefinitionStore.setClient(
      new TeskDefinitionZookeeperStore(
        config.taskDefinitionStore.zookeeperConfig.root,
        config.taskDefinitionStore.zookeeperConfig.connectionString,
        config.taskDefinitionStore.zookeeperConfig.options,
      ),
    );
    break;
  default:
    throw new Error(
      `TaskDefinition Store: ${config.taskDefinitionStore.type} is invalid`,
    );
}

if (config.server.enabled) {
  console.log('eiei');
  new server.Server(config.server.port, config.server.hostname, true);
}
