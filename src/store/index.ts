import { Task } from '@melonade/melonade-declaration';
import { TimerInstanceTypes } from '../kafka';

export interface IDelayTaskTimerInstance {
  timerId: string;
  type: TimerInstanceTypes.Delay;
  task: Task.ITask;
}

// Rn we only have 1 instance type
export type TimerInstance = IDelayTaskTimerInstance;

export interface IStore {
  isHealthy(): boolean;
}

export interface ITimerInstanceStore extends IStore {
  get(timerId: string): Promise<TimerInstance>;
  create(timerData: TimerInstance): Promise<TimerInstance>;
  delete(timerId: string): Promise<void>;
}

export interface ITimerLeaderStore extends IStore {
  isLeader(): boolean;
  list(): number[];
}

export class TimerInstanceStore {
  client: ITimerInstanceStore;
  localTimers: { [key: string]: any } = {};

  setClient(client: ITimerInstanceStore) {
    if (this.client) throw new Error('Already set client');
    this.client = client;
  }

  get(timerId: string) {
    return this.client.get(timerId);
  }

  create(timerData: TimerInstance) {
    return this.client.create(timerData);
  }

  delete(timerId: string) {
    return this.client.delete(timerId);
  }
}

export class TimerLeaderStore {
  client: ITimerLeaderStore;

  setClient(client: ITimerLeaderStore) {
    if (this.client) {
      throw new Error('Already set client');
    }
    this.client = client;
  }

  isLeader() {
    return this.client.isLeader();
  }

  list() {
    return this.client.list();
  }
}

export const timerInstanceStore = new TimerInstanceStore();
export const timerLeaderStore = new TimerLeaderStore();
