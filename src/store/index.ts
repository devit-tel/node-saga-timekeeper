export interface IStore {
  setValue(key: string, value: any): Promise<any> | any;
  getValue(key: string): Promise<any> | any;
  list(limit: number, offset: number): Promise<any[]> | any[];
  isHealthy(): boolean;
}

export enum StoreType {
  ZooKeeper = 'ZOOKEEPER', // Greate for Definition
  MongoDB = 'MONGODB',
  DynamoDB = 'DYNAMODB',
  Redis = 'REDIS', // Greate for Instance
  Memory = 'MEMORY', // For Dev/Test, don't use in production
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

  list(
    limit: number = Number.MAX_SAFE_INTEGER,
    offset: number = 0,
  ): Promise<any[]> | any[] {
    return this.client.list(limit, offset);
  }

  isHealthy(): boolean {
    return this.client.isHealthy();
  }
}

export class WorkflowDefinitionStore extends Store {
  setWorkflowDefinition = (
    name: string,
    rev: string,
    value: any,
  ): Promise<any> | any => {
    this.setValue(`${name}.${rev}`, value);
  };

  getWorkflowDefinition = (name: string, rev: string): Promise<any> | any => {
    this.getValue(`${name}.${rev}`);
  };
}

// This's global instance
export const taskDefinitionStore = new Store('Task Definition Store');
export const workflowDefinitionStore = new WorkflowDefinitionStore(
  'Workflow Definition Store',
);
export const taskInstanceStore = new Store('Task Instance Store');
export const workflowInstanceStore = new Store('Workflow Instance Store');
