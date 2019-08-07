export interface IStore {
  setValue(key: string, value: any): Promise<any> | any;
  getValue(key: string): Promise<any> | any;
}

export enum StoreType {
  ZooKeeper = 'ZOOKEEPER', // Greate for Definition
  MongoDB = 'MONGODB',
  DynamoDB = 'DYNAMODB',
  Redis = 'REDIS', // Greate for Instance
}

export class Store implements IStore {
  name: string;
  client: IStore;
  constructor(name: string) {
    this.name = name;
  }

  setClient(client: IStore) {
    if (this.client) throw new Error('Already set client');
    this.client = client;
  }

  setValue(key: string, value: any): Promise<any> | any {
    return this.client.setValue(key, value);
  }

  getValue(key: string): Promise<any> | any {
    return this.client.getValue(key);
  }
}

export const taskDefinitionStore = new Store('Task Definition Store');
export const workflowDefinitionStore = new Store('Workflow Definition Store');
export const taskInstanceStore = new Store('Task Instance Store');
export const workflowInstanceStore = new Store('Workflow Instance Store');
