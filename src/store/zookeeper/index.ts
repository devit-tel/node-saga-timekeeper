import * as zookeeper from 'node-zookeeper-client';
import * as R from 'ramda';
import { IStore } from '..';

export interface IZookeeperOptions {
  sessionTimeout: number;
  spinDelay: number;
  retries: number;
}

export enum ZookeeperEvents {
  NODE_CREATED = 'NODE_CREATED',
  NODE_DELETED = 'NODE_DELETED',
  NODE_DATA_CHANGED = 'NODE_DATA_CHANGED',
  NODE_CHILDREN_CHANGED = 'NODE_CHILDREN_CHANGED',
}

export interface IZookeeperEvent {
  type: number;
  name: ZookeeperEvents;
  path: string;
}

export class ZookeeperStore implements IStore {
  localStore: any = {};
  root: string = '/';
  client: any;

  constructor(
    root: string,
    connectionString: string,
    options?: IZookeeperOptions,
  ) {
    this.root = root;
    this.client = new zookeeper.createClient(connectionString, options);
    this.client.connect();
  }

  isHealthy(): boolean {
    return ['SYNC_CONNECTED', 'CONNECTED', 'CONNECTED_READ_ONLY'].includes(
      this.client.getState().name,
    );
  }

  setValue(key: string, value: any = ''): Promise<any> | any {
    return new Promise((resolve: Function, reject: Function) => {
      // This can make sure it's never overwrite old data
      this.client.mkdirp(
        `${this.root}/${key.replace(/\./, '/')}`,
        new Buffer(value),
        null,
        null,
        (error: Error, path: string) => {
          if (error) return reject(error);
          resolve(path);
        },
      );
    });
  }

  getValue(key: string = ''): Promise<any> | any {
    return R.path(key.split('.'), this.localStore);
  }
}
