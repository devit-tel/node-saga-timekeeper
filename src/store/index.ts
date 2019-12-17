import { Timer } from '@melonade/melonade-declaration';
import { delayTimer } from '../kafka';

export interface ITimerUpdate {
  ackTimeout?: boolean;
  timeout?: boolean;
  delay?: boolean;
  timerId: string;
}

export interface IStore {
  isHealthy(): boolean;
}

export enum TimerType {
  Delay = 'DELAY',
  Timeout = 'TIMEOUT',
  AckTimeout = 'ACK_TIMEOUT',
}

export type WatcherCallback = (type: TimerType, taskId: string) => void;

export interface ITimerInstanceStore extends IStore {
  get(timerId: string): Promise<Timer.ITimerData>;
  create(timerData: Timer.ITimerData): Promise<Timer.ITimerData>;
  delete(timerId: string): Promise<void>;
  update(timerUpdate: ITimerUpdate): Promise<Timer.ITimerData>;
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

  create = async (timerData: Timer.ITimerData) => {
    const timerInstance = await this.client.create(timerData);
    if (timerInstance.ackTimeout) {
      delayTimer({
        scheduledAt: timerData.ackTimeout,
        timerId: timerInstance.task.taskId,
        type: TimerType.AckTimeout,
      });
    }
    if (timerInstance.timeout) {
      delayTimer({
        scheduledAt: timerData.timeout,
        timerId: timerInstance.task.taskId,
        type: TimerType.Timeout,
      });
    }
    if (timerInstance.delay) {
      delayTimer({
        scheduledAt: timerData.delay,
        timerId: timerInstance.task.taskId,
        type: TimerType.Delay,
      });
    }

    return timerInstance;
  };

  update(timerUpdate: ITimerUpdate) {
    return this.client.update(timerUpdate);
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
