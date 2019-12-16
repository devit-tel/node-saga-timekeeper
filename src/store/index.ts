import { Timer } from '@melonade/melonade-declaration';
import { EventEmitter } from 'events';

export interface ITimerUpdate {
  ackTimeout?: boolean;
  timeout?: boolean;
  delay?: boolean;
  taskId: string;
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
  get(taskId: string): Promise<Timer.ITimerData>;
  create(taskData: Timer.ITimerData): Promise<Timer.ITimerData>;
  delete(taskId: string): Promise<any>;
  update(timerUpdate: ITimerUpdate): Promise<Timer.ITimerData>;
}

export interface ITimerLeaderStore extends IStore {
  isLeader(): boolean;
  list(): number[];
}

export class TimerInstanceStore extends EventEmitter {
  client: ITimerInstanceStore;
  localTimers: { [key: string]: any } = {};

  constructor() {
    super();
  }

  setClient(client: ITimerInstanceStore) {
    if (this.client) throw new Error('Already set client');
    this.client = client;
  }

  get(taskId: string) {
    return this.client.get(taskId);
  }

  private setTimer = (type: TimerType, taskId: string, when: number): void => {
    this.localTimers[`${type}-${taskId}`] = setTimeout(() => {
      this.emit(type, taskId);
    }, when - Date.now());
  };

  create = async (timerData: Timer.ITimerData) => {
    await this.client.create(timerData);
    if (timerData.ackTimeout) {
      this.setTimer(
        TimerType.AckTimeout,
        timerData.task.taskId,
        timerData.ackTimeout,
      );
    }

    if (timerData.timeout) {
      this.setTimer(
        TimerType.Timeout,
        timerData.task.taskId,
        timerData.timeout,
      );
    }

    if (timerData.delay) {
      this.setTimer(TimerType.Delay, timerData.task.taskId, timerData.delay);
    }

    return timerData;
  };

  private clearTimer = (type: TimerType, taskId: string): void => {
    if (this.localTimers[`${type}-${taskId}`]) {
      clearTimeout(this.localTimers[`${type}-${taskId}`]);
    }
  };

  delete(taskId: string) {
    this.clearTimer(TimerType.AckTimeout, taskId);
    this.clearTimer(TimerType.Timeout, taskId);
    this.clearTimer(TimerType.Delay, taskId);

    return this.client.delete(taskId);
  }

  update(timerUpdate: ITimerUpdate) {
    if (timerUpdate.ackTimeout) {
      this.clearTimer(TimerType.AckTimeout, timerUpdate.taskId);
    }

    if (timerUpdate.timeout) {
      this.clearTimer(TimerType.Timeout, timerUpdate.taskId);
    }

    if (timerUpdate.delay) {
      this.clearTimer(TimerType.Delay, timerUpdate.taskId);
    }

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
