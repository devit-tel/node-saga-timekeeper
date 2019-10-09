import ioredis from 'ioredis';
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
  constructor(redisOptions: ioredis.RedisOptions) {
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
          const extractedChannel = new RegExp(
            `^__keyspace@2__:${prefix}.(ackTimeout|timeout|delay)\.(.*)`,
          ).exec(channel);

          switch (extractedChannel[1]) {
            case 'ackTimeout':
              callback('ACK_TIMEOUT', extractedChannel[2]);
              break;
            case 'timeout':
              callback('TIMEOUT', extractedChannel[2]);
              break;
            case 'delay':
              callback('DELAY', extractedChannel[2]);
              break;
          }
        }
      },
    );
  }

  create = async (timerData: Timer.ITimerData): Promise<Timer.ITimerData> => {
    const key = `${prefix}.timer.${timerData.task.taskId}`;

    const pipeline = this.client.pipeline().set(key, JSON.stringify(timerData));

    if (timerData.ackTimeout) {
      // console.log('set ackTimeout');
      pipeline.set(
        `${prefix}.ackTimeout.${timerData.task.taskId}`,
        '',
        'PX',
        timerData.ackTimeout,
      );
    }

    if (timerData.timeout) {
      // console.log('set timeout');
      pipeline.set(
        `${prefix}.timeout.${timerData.task.taskId}`,
        '',
        'PX',
        timerData.timeout,
      );
    }

    if (timerData.delay) {
      // console.log('set delay');
      pipeline.set(
        `${prefix}.delay.${timerData.task.taskId}`,
        '',
        'PX',
        timerData.delay,
      );
    }

    await pipeline.exec();

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

    const pipeline = this.client.pipeline();

    if (timerUpdate.ackTimeout) {
      pipeline.del(ackTimeoutKey);
      notExpiredAckTimeout--;
    }

    if (timerUpdate.timeout) {
      pipeline.del(timeoutKey);
      notExpiredTimeout--;
    }

    if (notExpiredAckTimeout <= 0 && notExpiredTimeout <= 0) {
      pipeline.del(`${prefix}.timer.${timerUpdate.taskId}`);
    }

    await pipeline.exec();
  };
}
