export default class MemoryStore {
  name: string;
  store: {
    [key: string]: any;
  };
  constructor(storeName: string) {
    this.name = storeName;
  }

  getValue(key: string) {
    return this.store[key];
  }

  setValue(key: string, value: any) {
    this.store[key] = value;
    return value;
  }
}
