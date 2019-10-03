import * as config from './config';
import * as store from './store';
import { TimerInstanceMongooseStore } from './store/mongoose/timerInstance';
import { StoreType } from './store';
import './kafka';
import { executor as timerExecutor } from './timer';

switch (config.timerInstanceStoreConfig.type) {
  // case StoreType.Memory:
  //   store.workflowInstanceStore.setClient(new MemoryStore());
  //   break;
  case StoreType.MongoDB:
    store.timerInstanceStore.setClient(
      new TimerInstanceMongooseStore(
        config.timerInstanceStoreConfig.mongoDBConfig.uri,
        config.timerInstanceStoreConfig.mongoDBConfig.options,
      ),
    );
    break;
  default:
    throw new Error(
      `TimerInstance Store: ${config.timerInstanceStoreConfig.type} is invalid`,
    );
}

timerExecutor();
