import * as nodeZookeeperClient from 'node-zookeeper-client';
import { IStore } from '../../store';

export class ZookeeperStore implements IStore {
  localStore: any = {};
  root: string = '/';
  client: nodeZookeeperClient.Client;

  constructor(
    root: string,
    connectionString: string,
    options?: nodeZookeeperClient.Option,
  ) {
    this.root = root;
    this.client = nodeZookeeperClient.createClient(connectionString, options);
    this.client.connect();
  }

  isHealthy(): boolean {
    return ['SYNC_CONNECTED', 'CONNECTED', 'CONNECTED_READ_ONLY'].includes(
      this.client.getState().name,
    );
  }
}
