import { Timer } from '@melonade/melonade-declaration';
import ioredis from 'ioredis';
import * as R from 'ramda';
import { prefix } from '../../config';
import { ITimerInstanceStore, ITimerUpdate } from '../../store';
import { RedisStore } from '../redis';

const isNumber = R.is(Number);

const upsetFieldTimerField = (
  oldTimerData: Timer.ITimerData,
  TimerData: Timer.ITimerData,
  field: string,
): any => {
  return isNumber(oldTimerData[field]) ? oldTimerData[field] : TimerData[field];
};

export class TimerInstanceRedisStore extends RedisStore
  implements ITimerInstanceStore {
  constructor(redisOptions: ioredis.RedisOptions) {
    super(redisOptions);
  }

  create = async (timerData: Timer.ITimerData): Promise<Timer.ITimerData> => {
    const timerId = timerData.task.taskId;
    const timerKey = `${prefix}.timer.${timerId}`;
    const results = await this.client
      .pipeline()
      .get(timerKey)
      .setnx(timerKey, JSON.stringify(timerData))
      .exec();

    // If already set upsert
    if (results[1][1] !== 1) {
      const oldTimerData: Timer.ITimerData = JSON.parse(results[0][1]);
      const newTimerData: Timer.ITimerData = {
        ackTimeout: upsetFieldTimerField(oldTimerData, timerData, 'ackTimeout'),
        timeout: upsetFieldTimerField(oldTimerData, timerData, 'timeout'),
        delay: timerData.delay || oldTimerData.delay, // case of delay always overides
        task: timerData.task,
      };
      await this.client.set(timerKey, JSON.stringify(newTimerData));
      return newTimerData;
    } else {
      return timerData;
    }
  };

  get = async (timerId: string): Promise<Timer.ITimerData> => {
    const taskData = await this.getValue(`${prefix}.timer.${timerId}`);

    if (taskData) return JSON.parse(taskData);
    return null;
  };

  delete(timerId: string): Promise<any> {
    return this.unsetValue([`${prefix}.timer.${timerId}`]);
  }

  update = async (timerUpdate: ITimerUpdate): Promise<Timer.ITimerData> => {
    const timerKey = `${prefix}.timer.${timerUpdate.timerId}`;

    const timerData = {
      ackTimeout: timerUpdate.ackTimeout ? 0 : undefined,
      timeout: timerUpdate.timeout ? 0 : undefined,
      delay: timerUpdate.delay ? 0 : undefined,
    };

    const results = await this.client
      .pipeline()
      .get(timerKey)
      .setnx(timerKey, JSON.stringify(timerData))
      .exec();

    if (results[1][1] !== 1) {
      const oldTimerData: Timer.ITimerData = JSON.parse(results[0][1]);
      const newTimerData: Timer.ITimerData = {
        ackTimeout: timerUpdate.ackTimeout ? 0 : oldTimerData.ackTimeout,
        timeout: timerUpdate.timeout ? 0 : oldTimerData.timeout,
        delay: timerUpdate.delay ? 0 : oldTimerData.delay,
        task: oldTimerData.task,
      };

      if (
        !newTimerData.ackTimeout &&
        !newTimerData.timeout &&
        !newTimerData.delay
      ) {
        await this.client.del(timerKey);
      } else {
        await this.client.set(timerKey, JSON.stringify(newTimerData));
      }
      return newTimerData;
    } else {
      if (!timerData.ackTimeout && !timerData.timeout && !timerData.delay) {
        await this.client.del(timerKey);
      }
      return timerData as Timer.ITimerData;
    }
  };
}
