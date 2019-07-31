import * as Task from '../task';

export interface IDispatcher {
  dispatch(taskName: string, task: Task.Task): void;
}

export class Dispatcher {
  constructor(dp: IDispatcher) {}
}
