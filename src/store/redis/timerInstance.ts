import ioredis from 'ioredis';
import { prefix } from '../../config';
import { ITimerInstanceStore, TimerInstance } from '../../store';
import { RedisStore } from '../redis';

export class TimerInstanceRedisStore extends RedisStore
  implements ITimerInstanceStore {
  constructor(redisOptions: ioredis.RedisOptions) {
    super(redisOptions);
  }

  create = async (timerData: TimerInstance): Promise<TimerInstance> => {
    const timerId = timerData.task.taskId;
    const timerKey = `${prefix}.timer.${timerId}`;
    const result = await this.client.setnx(timerKey, JSON.stringify(timerData));

    if (result !== 1) {
      return this.create(timerData);
    } else {
      return timerData;
    }
  };

  get = async (timerId: string): Promise<TimerInstance> => {
    const taskData = await this.getValue(`${prefix}.timer.${timerId}`);
    if (taskData) return JSON.parse(taskData);
    return null;
  };

  delete(timerId: string): Promise<any> {
    return this.unsetValue([`${prefix}.timer.${timerId}`]);
  }
}
