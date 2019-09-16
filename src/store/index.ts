import { ITimerData, ITimerUpdate } from '../timer';
export interface IStore {
  isHealthy(): boolean;
}

export interface ITimerInstanceStore extends IStore {
  get(taskId: string): Promise<ITimerData>;
  getAll(partitionId: string): Promise<ITimerData[]>;
  create(taskData: ITimerData): Promise<ITimerData>;
  delete(taskId: string): Promise<any>;
  update(timerUpdate: ITimerUpdate): Promise<ITimerData>;
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

  getAll(partitionId: string) {
    return this.client.getAll(partitionId);
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
}

export const timerInstanceStore = new TimerInstanceStore();
