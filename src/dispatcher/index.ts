import * as Task from '../task';

export interface IDispatcher {
  dispatch(taskName: string, task: Task.Task): void;
}

export enum DispatcherType {
  kafka = 'KAFKA',
}

export class Dispatcher implements IDispatcher {
  client: IDispatcher;
  constructor(client: IDispatcher) {
    this.client = client;
  }

  dispatch(taskName: string, task: Task.Task) {
    this.client.dispatch(taskName, task);
  }
}
