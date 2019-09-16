import * as config from './config';
import * as store from './store';
import { TimerInstanceMongooseStore } from './store/mongoose/timerInstance';
import { StoreType } from './constants/store';
import './kafka';
import { executor as timerExecutor } from './timer';

switch (config.timerInstanceStore.type) {
  // case StoreType.Memory:
  //   store.workflowInstanceStore.setClient(new MemoryStore());
  //   break;
  case StoreType.MongoDB:
    store.timerInstanceStore.setClient(
      new TimerInstanceMongooseStore(
        config.timerInstanceStore.mongoDBConfig.uri,
        config.timerInstanceStore.mongoDBConfig.options,
      ),
    );
    break;
  default:
    throw new Error(
      `TimerInstance Store: ${config.timerInstanceStore.type} is invalid`,
    );
}

timerExecutor();
