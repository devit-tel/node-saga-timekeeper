// Serializer for 1 layer node (${root}/${taskName})
import * as R from 'ramda';
import {
  ZookeeperStore,
  IZookeeperOptions,
  IZookeeperEvent,
  ZookeeperEvents,
} from '../zookeeper';
import { jsonTryParse } from '../../utils/common';

export class TeskDefinitionZookeeperStore extends ZookeeperStore {
  constructor(
    root: string,
    connectionString: string,
    options?: IZookeeperOptions,
  ) {
    super(root, connectionString, options);

    this.client.mkdirp(this.root, null, null, null, (error: Error) => {
      if (!error) {
        this.getAndWatchTasks();
      }
    });
  }

  getAndWatchTasks = () => {
    this.client.getChildren(
      this.root,
      (event: IZookeeperEvent) => {
        switch (event.name) {
          case ZookeeperEvents.NODE_CHILDREN_CHANGED:
            // When created new task, this is also fired when task are deleted, but did not handled at this time
            this.getAndWatchTasks();
            break;
          default:
            break;
        }
        return true;
      },
      (tasksError: Error, tasks: string[]) => {
        if (!tasksError) {
          for (const task of tasks) {
            if (R.isNil(this.localStore.rav)) {
              this.client.getData(
                `${this.root}/${task}`,
                null,
                (dataError: Error, data: Buffer) => {
                  if (!dataError) {
                    this.localStore[task] = jsonTryParse(data.toString());
                  }
                },
              );
            }
          }
        }
      },
    );
  };
}
