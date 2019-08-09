import * as config from './config';
import * as store from './store';
import { WorkflowDefinitionZookeeperStore } from './store/zookeeper/workflowDefinition';
import { TaskDefinitionZookeeperStore } from './store/zookeeper/taskDefinition';
import { Server } from './server';
import './kafka';

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
      new TaskDefinitionZookeeperStore(
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
  new Server(config.server.port, config.server.hostname, true);
}
