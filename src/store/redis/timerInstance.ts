import { Timer } from '@melonade/melonade-declaration';
import ioredis from 'ioredis';
import { prefix } from '../../config';
import { ITimerInstanceStore, ITimerUpdate } from '../../store';
import { RedisStore } from '../redis';

export class TimerInstanceRedisStore extends RedisStore
  implements ITimerInstanceStore {
  constructor(redisOptions: ioredis.RedisOptions) {
    super(redisOptions);
  }

  create = async (timerData: Timer.ITimerData): Promise<Timer.ITimerData> => {
    await this.client.set(
      `${prefix}.timer.${timerData.task.taskId}`,
      JSON.stringify(timerData),
    );

    return timerData;
  };

  get = async (taskId: string): Promise<Timer.ITimerData> => {
    const taskData = await this.getValue(`${prefix}.timer.${taskId}`);

    if (taskData) return JSON.parse(taskData);
    return null;
  };

  delete(taskId: string): Promise<any> {
    return this.unsetValue([`${prefix}.timer.${taskId}`]);
  }

  update = async (timerUpdate: ITimerUpdate): Promise<any> => {
    const timerInstance = await this.get(timerUpdate.taskId);

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
        await this.delete(timerUpdate.taskId);
      } else {
        await this.client.set(
          `${prefix}.timer.${timerUpdate.taskId}`,
          JSON.stringify(timerInstance),
        );
      }
    }
  };
}
