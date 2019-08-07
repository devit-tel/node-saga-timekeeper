import * as zookeeper from 'node-zookeeper-client';
import * as R from 'ramda';
import { IStore } from './';

export interface IZookeeperOptions {
  sessionTimeout: number;
  spinDelay: number;
  retries: number;
}

enum ZookeeperEvents {
  NODE_CREATED = 'NODE_CREATED',
  NODE_DELETED = 'NODE_DELETED',
  NODE_DATA_CHANGED = 'NODE_DATA_CHANGED',
  NODE_CHILDREN_CHANGED = 'NODE_CHILDREN_CHANGED',
}

interface IZookeeperEvent {
  type: number;
  name: ZookeeperEvents;
  path: string;
}

export class ZookeeperStore implements IStore {
  private localStore: any = {};
  private root: string = '/';
  private client: any;

  constructor(
    root: string,
    connectionString: string,
    options?: IZookeeperOptions,
  ) {
    this.root = root;
    this.client = new zookeeper.createClient(connectionString, options);
    this.client.connect();

    this.client.mkdirp(this.root, null, null, null, (error: Error) => {
      if (!error) {
        this.getAndWatchWorkflows();
      }
    });
  }

  getAndWatchWorkflows = () => {
    this.client.getChildren(
      this.root,
      (event: IZookeeperEvent) => {
        switch (event.name) {
          case ZookeeperEvents.NODE_CHILDREN_CHANGED:
            this.getAndWatchWorkflows();
            break;
          default:
            break;
        }
      },
      (error: Error, workflows: string[]) => {
        if (!error) {
          workflows.map(this.getAndWatchRefs);
        }
      },
    );
  };

  getAndWatchRefs = (workflow: string) => {
    this.client.getChildren(
      `${this.root}/${workflow}`,
      (event: IZookeeperEvent) => {
        switch (event.name) {
          case ZookeeperEvents.NODE_CHILDREN_CHANGED:
            // When add new ref, this is also fire when ref are deleted, but did not work at this time
            this.getAndWatchRefs(workflow);
            break;
          default:
            break;
        }
        return true;
      },
      (workflowError: Error, revs: string[]) => {
        if (!workflowError) {
          for (const rev of revs) {
            if (R.isNil(R.path([workflow, rev], this.localStore))) {
              this.client.getData(
                `${this.root}/${workflow}/${rev}`,
                null,
                (dataError: Error, data: Buffer) => {
                  if (!dataError) {
                    console.log(data.toString());
                    this.localStore = R.set(
                      R.lensPath([workflow, rev]),
                      data.toString(),
                      this.localStore,
                    );
                  }
                },
              );
            }
          }
        }
      },
    );
  };

  isHealhty(): boolean {
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
