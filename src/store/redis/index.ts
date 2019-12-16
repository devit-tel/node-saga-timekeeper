import ioredis from 'ioredis';
import { IStore } from '../../store';

export class RedisStore implements IStore {
  client: ioredis.Redis;
  connected: boolean = false;
  constructor(redisOptions: ioredis.RedisOptions) {
    this.client = new ioredis(redisOptions);

    this.client
      .on('connect', () => {
        this.connected = true;
      })
      .on('close', () => {
        this.connected = false;
      });
  }

  isHealthy(): boolean {
    return this.connected;
  }

  setValue(key: string, value: string): Promise<string> {
    return this.client.set(key, value);
  }

  unsetValue(keys: string[]): Promise<number> {
    return this.client.del(...keys);
  }

  getValue(key: string): Promise<string> {
    return this.client.get(key);
  }
}
