// Serializer for 1 layer node (${root}/${taskName})
import * as nodeZookeeperClient from 'node-zookeeper-client';
import { ZookeeperStore } from '.';
import { ITimerLeaderStore } from '..';

// This is wrong
export class TimerLeaderZookeeperStore extends ZookeeperStore
  implements ITimerLeaderStore {
  private candidateId: number;
  private currentLeaderId: number;
  private candidates: number[] = [];

  constructor(
    root: string,
    connectionString: string,
    options?: nodeZookeeperClient.Option,
  ) {
    super(root, connectionString, options);

    this.client.mkdirp(
      this.root,
      null,
      null,
      nodeZookeeperClient.CreateMode.PERSISTENT,
      (error: Error) => {
        if (!error) {
          this.applyForCandidate();
        }
      },
    );
  }

  applyForCandidate() {
    this.client.create(
      `${this.root}/timekeeper`,
      Buffer.from(''),
      nodeZookeeperClient.CreateMode.EPHEMERAL_SEQUENTIAL,
      (error, path) => {
        if (error) return console.log(error);
        this.candidateId = +path.replace(
          new RegExp(`^${this.root}/timekeeper*`),
          '',
        );
        this.listCandidates();
      },
    );
  }

  listCandidates() {
    this.client.getChildren(
      `${this.root}`,
      (event: nodeZookeeperClient.Event) => {
        switch (event.type) {
          case nodeZookeeperClient.Event.NODE_CHILDREN_CHANGED:
            this.listCandidates();
            break;
          default:
            break;
        }
        return true;
      },
      (error: Error, childrens: string[]) => {
        if (!error) {
          this.checkForLeader(
            childrens.map(
              children => +children.replace(new RegExp(`^timekeeper*`), ''),
            ),
          );
        }
      },
    );
  }

  checkForLeader(candidates: number[]) {
    this.candidates = candidates;
    this.currentLeaderId = Math.min(...candidates);

    if (this.isLeader()) {
      console.log("I'm leader now");
    }
  }

  list(): number[] {
    return this.candidates;
  }

  isLeader(): boolean {
    return this.currentLeaderId === this.candidateId;
  }
}
