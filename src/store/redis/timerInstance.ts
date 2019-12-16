import { Timer } from '@melonade/melonade-declaration';
import ioredis from 'ioredis';
import * as uuid from 'uuid/v4';
import { prefix } from '../../config';
import { ITimerInstanceStore, ITimerUpdate } from '../../store';
import { RedisStore } from '../redis';

export class TimerInstanceRedisStore extends RedisStore
  implements ITimerInstanceStore {
  constructor(redisOptions: ioredis.RedisOptions) {
    super(redisOptions);
  }

  create = async (timerData: Timer.ITimerData): Promise<string> => {
    const timerId = uuid();
    const result = await this.client.setnx(
      `${prefix}.timer.${timerId}`,
      JSON.stringify(timerData),
    );

    // If cannot set create again (nx = set if not exists)
    if (result !== 1) {
      return this.create(timerData);
    }

    return timerId;
  };

  get = async (timerId: string): Promise<Timer.ITimerData> => {
    const taskData = await this.getValue(`${prefix}.timer.${timerId}`);

    if (taskData) return JSON.parse(taskData);
    return null;
  };

  delete(timerId: string): Promise<any> {
    return this.unsetValue([`${prefix}.timer.${timerId}`]);
  }

  update = async (timerUpdate: ITimerUpdate): Promise<any> => {
    const timerInstance = await this.get(timerUpdate.timerId);

    if (timerInstance) {
      timerInstance.ackTimeout = timerUpdate.ackTimeout
        ? 0
        : timerInstance.ackTimeout;
      timerInstance.timeout = timerUpdate.timeout ? 0 : timerInstance.timeout;
      timerInstance.delay = timerUpdate.delay ? 0 : timerInstance.delay;

      if (
        !timerInstance.ackTimeout &&
        !timerInstance.timeout &&
        !timerInstance.delay
      ) {
        await this.delete(timerUpdate.timerId);
      } else {
        await this.setValue(
          `${prefix}.timer.${timerUpdate.timerId}`,
          JSON.stringify(timerInstance),
        );
      }
    }
  };
}
