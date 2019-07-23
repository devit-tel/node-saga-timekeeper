import * as R from 'ramda';

export const isString = R.is(String);

export const isNumber = R.is(Number);

export const isValidName = (name: string): boolean =>
  isString(name) && /^[a-zA-Z0-9-_]{1,32}$/.test(name);

export const isValidRev = (rev: number): boolean =>
  Number.isInteger(rev) && rev > 0;

export const enumToList = R.compose(
  R.map(R.prop('1')),
  R.toPairs,
);

export const concatArray = (target: any[] = [], items: any[] | any): any[] => {
  if (R.isNil(items)) return target;
  if (R.is(Array, items)) return target.concat(items);
  return [...target, items];
};
