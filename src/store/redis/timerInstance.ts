import * as redis from 'redis';
import { Timer } from '@melonade/melonade-declaration';
import { RedisStore, RedisSubscriber } from '../redis';
import {
  ITimerInstanceStore,
  ITimerUpdate,
  WatcherCallback,
} from '../../store';
import { prefix } from '../../config';

export class TimerInstanceRedisStore extends RedisStore
  implements ITimerInstanceStore {
  subscriber: RedisSubscriber;
  constructor(redisOptions: redis.ClientOpts) {
    super(redisOptions);
    this.subscriber = new RedisSubscriber(redisOptions, [
      `${prefix}.delay.*`,
      `${prefix}.ackTimeout.*`,
      `${prefix}.timeout.*`,
    ]);
  }

  watch(callback: WatcherCallback) {
    this.subscriber.client.on(
      'pmessage',
      async (_pattern: string, channel: string, message: string) => {
        if (message === 'expired') {
          const extractedTimeoutChannel = new RegExp(
            `^__keyspace@2__:${prefix}.(ackTimeout|timeout)\.(.*)`,
          ).exec(channel);

          const extractedDelayChannel = new RegExp(
            `^__keyspace@2__:${prefix}.delay\.(.*)`,
          ).exec(channel);

          if (extractedTimeoutChannel) {
            callback('TIMEOUT', extractedTimeoutChannel[2]);
          } else if (extractedDelayChannel) {
            callback('DELAY', extractedDelayChannel[1]);
          }
        }

        callback;
      },
    );
  }

  create = async (timerData: Timer.ITimerData): Promise<Timer.ITimerData> => {
    const key = `${prefix}.timer.${timerData.task.taskId}`;
    const list = [this.setValue(key, JSON.stringify(timerData))];

    if (timerData.ackTimeout) {
      console.log('set ackTimeout');
      list.push(
        this.setValueExpire(
          `${prefix}.ackTimeout.${timerData.task.taskId}`,
          '',
          timerData.ackTimeout,
        ),
      );
    }

    if (timerData.timeout) {
      console.log('set timeout');
      list.push(
        this.setValueExpire(
          `${prefix}.timeout.${timerData.task.taskId}`,
          '',
          timerData.timeout,
        ),
      );
    }

    if (timerData.delay) {
      console.log('set delay');
      list.push(
        this.setValueExpire(
          `${prefix}.delay.${timerData.task.taskId}`,
          '',
          timerData.delay,
        ),
      );
    }

    await Promise.all(list);

    return timerData;
  };

  get = async (taskId: string): Promise<Timer.ITimerData> => {
    const taskData = await this.getValue(`${prefix}.timer.${taskId}`);

    if (taskData) return JSON.parse(taskData);
    return null;
  };

  delete(taskId: string): Promise<any> {
    return this.unsetValue([
      `${prefix}.timer.${taskId}`,
      `${prefix}.delay.${taskId}`,
      `${prefix}.ackTimeout.${taskId}`,
      `${prefix}.timeout.${taskId}`,
    ]);
  }

  update = async (timerUpdate: ITimerUpdate): Promise<any> => {
    const ackTimeoutKey = `${prefix}.ackTimeout.${timerUpdate.taskId}`;
    const timeoutKey = `${prefix}.timeout.${timerUpdate.taskId}`;

    let [notExpiredAckTimeout, notExpiredTimeout] = await Promise.all([
      this.checkKeys([ackTimeoutKey]),
      this.checkKeys([timeoutKey]),
    ]);

    const list = [];

    if (timerUpdate.ackTimeout) {
      list.push(this.unsetValue(ackTimeoutKey));
      notExpiredAckTimeout--;
    }

    if (timerUpdate.timeout) {
      list.push(this.unsetValue(timeoutKey));
      notExpiredTimeout--;
    }

    if (notExpiredAckTimeout <= 0 && notExpiredTimeout <= 0) {
      list.push(this.unsetValue(`${prefix}.timer.${timerUpdate.taskId}`));
    }

    await Promise.all(list);
  };
}
