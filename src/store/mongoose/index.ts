import * as mongoose from 'mongoose';
import { IStore } from '..';

export class MongooseStore<T = any> implements IStore {
  model: mongoose.Model<T & mongoose.Document>;
  connection: mongoose.Connection;

  constructor(
    uri: string,
    mongoOption: mongoose.ConnectionOptions,
    name: string,
    schema: mongoose.Schema<T>,
  ) {
    this.connection = mongoose.createConnection(uri, mongoOption);
    this.model = this.connection.model(name, schema);
  }

  isHealthy(): boolean {
    return this.connection.readyState === 1;
  }
}
