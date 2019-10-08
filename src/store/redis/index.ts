import { IStore } from '../../store';
import * as redis from 'redis';

export class RedisStore implements IStore {
  client: redis.RedisClient;
  constructor(redisOptions: redis.ClientOpts) {
    this.client = redis.createClient(redisOptions);
  }

  isHealthy(): boolean {
    return this.client.connected;
  }

  setValue(key: string, value: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.client.set(key, value, (error: Error) => {
        if (error) return reject(error);
        resolve(value);
      });
    });
  }

  setValueExpire(key: string, value: string, ms: number): Promise<string> {
    return new Promise((resolve, reject) => {
      this.client.set(key, value, 'PX', ms, (error: Error) => {
        if (error) return reject(error);
        resolve(value);
      });
    });
  }

  unsetValue(key: string | string[]): Promise<number> {
    return new Promise((resolve, reject) => {
      this.client.del(key, (error: Error, reply: number) => {
        if (error) return reject(error);
        resolve(reply);
      });
    });
  }

  getValue(key: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.client.get(key, (error: Error, reply: string) => {
        if (error) return reject(error);
        resolve(reply);
      });
    });
  }

  checkKeys(keys: string[]): Promise<number> {
    return new Promise((resolve, reject) => {
      this.client.exists(keys, (error: Error, reply: number) => {
        if (error) return reject(error);
        resolve(reply);
      });
    });
  }

  scanKey(pattern: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.client.scan(
        '0',
        'MATCH',
        pattern,
        (error: Error, reply: [string, string[]]) => {
          if (error) return reject(error);
          resolve(reply[1]);
        },
      );
    });
  }
}

export class RedisSubscriber implements IStore {
  client: redis.RedisClient;

  constructor(redisOptions: redis.ClientOpts, patterns: string[]) {
    this.client = redis.createClient(redisOptions);

    this.client.config('SET', 'notify-keyspace-events', 'xK');

    for (const pattern of patterns) {
      this.client.psubscribe(`__keyspace@${redisOptions.db}__:${pattern}`);
    }
  }

  isHealthy(): boolean {
    return this.client.connected;
  }
}
