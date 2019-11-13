import { Store } from '@melonade/melonade-declaration';
import * as config from './config';
import { executor as eventExecutor } from './eventWatcher';
import './kafka';
import * as store from './store';
// import { TimerInstanceMongooseStore } from './store/mongoose/timerInstance';
import { TimerInstanceRedisStore } from './store/redis/timerInstance';
import { TimerLeaderZookeeperStore } from './store/zookeeper/timerLeader';
import { executor as storeExecutor } from './storeWatcher';
import { executor as taskExecutor } from './taskWatcher';
import { executor as timerExecutor } from './timerWatcher';

switch (config.timerInstanceStoreConfig.type) {
  // case StoreType.Memory:
  //   store.workflowInstanceStore.setClient(new MemoryStore());
  //   break;
  // case StoreType.MongoDB:
  //   store.timerInstanceStore.setClient(
  //     new TimerInstanceMongooseStore(
  //       config.timerInstanceStoreConfig.mongoDBConfig.uri,
  //       config.timerInstanceStoreConfig.mongoDBConfig.options,
  //     ),
  //   );
  //   break;
  case Store.StoreType.Redis:
    store.timerInstanceStore.setClient(
      new TimerInstanceRedisStore(config.timerInstanceStoreConfig.redisConfig),
    );
    break;
  default:
    throw new Error(
      `TimerInstance Store: ${config.timerInstanceStoreConfig.type} is invalid`,
    );
}

switch (config.timerLeaderStoreConfig.type) {
  case Store.StoreType.ZooKeeper:
    store.timerLeaderStore.setClient(
      new TimerLeaderZookeeperStore(
        config.timerLeaderStoreConfig.zookeeperConfig.root,
        config.timerLeaderStoreConfig.zookeeperConfig.connectionString,
        config.timerLeaderStoreConfig.zookeeperConfig.options,
      ),
    );
    break;
  default:
    throw new Error(
      `TimerLeader Store: ${config.timerLeaderStoreConfig.type} is invalid`,
    );
}

storeExecutor();
timerExecutor();
taskExecutor();
eventExecutor();
