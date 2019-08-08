// Serializer for 2 layer node (${root}/${workflowName}/${workflowRev})
import * as R from 'ramda';
import * as zookeeper from '.';

export class WorkflowDefinitionZookeeperStore extends zookeeper.ZookeeperStore {
  constructor(
    root: string,
    connectionString: string,
    options?: zookeeper.IZookeeperOptions,
  ) {
    super(root, connectionString, options);

    super.client.mkdirp(super.root, null, null, null, (error: Error) => {
      if (!error) {
        this.getAndWatchWorkflows();
      }
    });
  }

  getAndWatchWorkflows = () => {
    this.client.getChildren(
      this.root,
      (event: zookeeper.IZookeeperEvent) => {
        switch (event.name) {
          case zookeeper.ZookeeperEvents.NODE_CHILDREN_CHANGED:
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
      (event: zookeeper.IZookeeperEvent) => {
        switch (event.name) {
          case zookeeper.ZookeeperEvents.NODE_CHILDREN_CHANGED:
            // When add new ref, this is also fire when ref are deleted, but did not work at this time
            this.getAndWatchRefs(workflow);
            break;
          default:
            break;
        }
        return true;
      },
      (workflowError: Error, refs: string[]) => {
        if (!workflowError) {
          for (const ref of refs) {
            if (R.isNil(R.path([workflow, ref], this.localStore))) {
              this.client.getData(
                `${this.root}/${workflow}/${ref}`,
                null,
                (dataError: Error, data: Buffer) => {
                  if (!dataError) {
                    console.log(data.toString());
                    this.localStore = R.set(
                      R.lensPath([workflow, ref]),
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
}
