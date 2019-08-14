import * as config from './config';
import * as store from './store';
import { WorkflowDefinitionZookeeperStore } from './store/zookeeper/workflowDefinition';
import { TaskDefinitionZookeeperStore } from './store/zookeeper/taskDefinition';
import { MemoryStore } from './store/memory';
import { Server } from './server';
import { executor as stateExecutor } from './state';
import { executor as systemTaskExecutor } from './systemTask';
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

switch (config.workflowInstanceStore.type) {
  case store.StoreType.Memory:
    store.workflowInstanceStore.setClient(new MemoryStore());
    break;
  default:
    throw new Error(
      `WorkflowInstance Store: ${config.workflowInstanceStore.type} is invalid`,
    );
}

switch (config.taskInstanceStore.type) {
  case store.StoreType.Memory:
    store.taskInstanceStore.setClient(new MemoryStore());
    break;
  default:
    throw new Error(
      `WorkflowInstance Store: ${config.taskInstanceStore.type} is invalid`,
    );
}

if (config.server.enabled) {
  new Server(config.server.port, config.server.hostname, true);
}

stateExecutor();
systemTaskExecutor();
