// Serializer for 1 layer node (${root}/${taskName})
import * as R from 'ramda';
import * as zookeeper from '.';

export class TeskDefinitionZookeeperStore extends zookeeper.ZookeeperStore {
  constructor(
    root: string,
    connectionString: string,
    options?: zookeeper.IZookeeperOptions,
  ) {
    super(root, connectionString, options);

    super.client.mkdirp(super.root, null, null, null, (error: Error) => {
      if (!error) {
        this.getAndWatchTasks();
      }
    });
  }

  getAndWatchTasks = () => {
    this.client.getChildren(
      this.root,
      (event: zookeeper.IZookeeperEvent) => {
        switch (event.name) {
          case zookeeper.ZookeeperEvents.NODE_CHILDREN_CHANGED:
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
                    console.log(data.toString());
                    this.localStore[task] = data.toString();
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
