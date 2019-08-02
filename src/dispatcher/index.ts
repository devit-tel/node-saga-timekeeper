import * as Task from '../task';

export interface IDispatcher {
  dispatch(taskName: string, task: Task.Task): void;
}

export enum DispatcherType {
  Kafka = 'KAFKA',
}

export class Dispatcher implements IDispatcher {
  name: string;
  client: IDispatcher;
  constructor(name: string) {
    this.name = name;
  }

  setClient(client: IDispatcher) {
    if (client) throw new Error('Already set client');
    this.client = client;
  }

  dispatch(taskName: string, task: Task.Task) {
    this.client.dispatch(taskName, task);
  }
}

export const dispatcher = new Dispatcher('Main dispatcher');
