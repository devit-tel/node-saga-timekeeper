import * as R from 'ramda';
import { IStore } from '..';
import { enumToList } from '../../utils/common';

export class MemoryStore implements IStore {
  localStore: any = {};

  constructor() {}

  isHealthy(): boolean {
    return true;
  }

  setValue(key: string, value: any): any {
    return (this.localStore = R.set(
      R.lensPath(key.split('.')),
      value,
      this.localStore,
    ));
  }

  getValue(key: string): any {
    return R.path(key.split('.'), this.localStore);
  }

  list(limit: number = Number.MAX_SAFE_INTEGER, offset: number = 0): any[] {
    return R.slice(offset, limit, enumToList(this.localStore));
  }
}
