import { executors as delayExecutors } from './delayWatcher';
import './kafka';
import { executor as taskExecutor } from './taskWatcher';
import { executor as timerExecutor } from './timerWatcher';

delayExecutors();
timerExecutor();
taskExecutor();
