import { ITimerData } from '../timer';

export enum StoreType {
  ZooKeeper = 'ZOOKEEPER', // Greate for Definition
  MongoDB = 'MONGODB',
  DynamoDB = 'DYNAMODB',
  Redis = 'REDIS', // Greate for Instance
  Memory = 'MEMORY', // For Dev/Test, don't use in production
}

export interface ITimerUpdate {
  ackTimeout?: boolean;
  timeout?: boolean;
  taskId: string;
}

export interface IStore {
  isHealthy(): boolean;
}

export type WatcherCallback = (
  type: 'DELAY' | 'TIMEOUT',
  taskId: string,
) => void;

export interface ITimerInstanceStore extends IStore {
  get(taskId: string): Promise<ITimerData>;
  create(taskData: ITimerData): Promise<ITimerData>;
  delete(taskId: string): Promise<any>;
  update(timerUpdate: ITimerUpdate): Promise<ITimerData>;
  watch(callback: WatcherCallback): void;
}

export class TimerInstanceStore {
  client: ITimerInstanceStore;

  setClient(client: ITimerInstanceStore) {
    if (this.client) throw new Error('Already set client');
    this.client = client;
  }

  get(taskId: string) {
    return this.client.get(taskId);
  }

  create(timerData: ITimerData) {
    return this.client.create(timerData);
  }

  delete(taskId: string) {
    return this.client.delete(taskId);
  }

  update(timerUpdate: ITimerUpdate) {
    return this.client.update(timerUpdate);
  }

  watch(callback: WatcherCallback) {
    return this.client.watch(callback);
  }
}

export const timerInstanceStore = new TimerInstanceStore();
