import * as config from './config';
import * as store from './store';
import { WorkflowDefinitionZookeeperStore } from './store/zookeeper/workflowDefinition';
import { TaskDefinitionZookeeperStore } from './store/zookeeper/taskDefinition';
// import { MemoryStore } from './store/memory';
import { TaskInstanceMongooseStore } from './store/mongoose/taskInstance';
import { WorkflowInstanceMongoseStore } from './store/mongoose/workflowInstance';
import { Server } from './server';
import { executor as stateExecutor } from './state';
import { executor as systemTaskExecutor } from './systemTask';
import { StoreType } from './constants/store';
import './kafka';
import { TransactionInstanceMongoseStore } from './store/mongoose/transactionInstance';

switch (config.workflowDefinitionStore.type) {
  case StoreType.ZooKeeper:
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
  case StoreType.ZooKeeper:
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

switch (config.transactionInstanceStore.type) {
  // case StoreType.Memory:
  //   store.transactionInstanceStore.setClient(new MemoryStore());
  //   break;
  case StoreType.MongoDB:
    store.transactionInstanceStore.setClient(
      new TransactionInstanceMongoseStore(
        config.transactionInstanceStore.mongoDBConfig.uri,
        config.transactionInstanceStore.mongoDBConfig.options,
      ),
    );
    break;
  default:
    throw new Error(
      `TranscationInstance Store: ${config.transactionInstanceStore.type} is invalid`,
    );
}

switch (config.workflowInstanceStore.type) {
  // case StoreType.Memory:
  //   store.workflowInstanceStore.setClient(new MemoryStore());
  //   break;
  case StoreType.MongoDB:
    store.workflowInstanceStore.setClient(
      new WorkflowInstanceMongoseStore(
        config.workflowInstanceStore.mongoDBConfig.uri,
        config.workflowInstanceStore.mongoDBConfig.options,
      ),
    );
    break;
  default:
    throw new Error(
      `WorkflowInstance Store: ${config.workflowInstanceStore.type} is invalid`,
    );
}

switch (config.taskInstanceStore.type) {
  // case StoreType.Memory:
  //   store.taskInstanceStore.setClient(new MemoryStore());
  //   break;
  case StoreType.MongoDB:
    store.taskInstanceStore.setClient(
      new TaskInstanceMongooseStore(
        config.taskInstanceStore.mongoDBConfig.uri,
        config.taskInstanceStore.mongoDBConfig.options,
      ),
    );
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
