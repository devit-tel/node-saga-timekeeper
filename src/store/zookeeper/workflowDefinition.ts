// Serializer for 2 layer node (${root}/${workflowName}/${workflowRev})
import * as R from 'ramda';
import {
  ZookeeperStore,
  IZookeeperOptions,
  IZookeeperEvent,
  ZookeeperEvents,
} from '../zookeeper';
import { jsonTryParse } from '../../utils/common';

export class WorkflowDefinitionZookeeperStore extends ZookeeperStore {
  constructor(
    root: string,
    connectionString: string,
    options?: IZookeeperOptions,
  ) {
    super(root, connectionString, options);

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
      (workflowError: Error, refs: string[]) => {
        if (!workflowError) {
          for (const ref of refs) {
            if (R.isNil(R.path([workflow, ref], this.localStore))) {
              this.client.getData(
                `${this.root}/${workflow}/${ref}`,
                null,
                (dataError: Error, data: Buffer) => {
                  if (!dataError) {
                    this.localStore = R.set(
                      R.lensPath([workflow, ref]),
                      jsonTryParse(data.toString()),
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
