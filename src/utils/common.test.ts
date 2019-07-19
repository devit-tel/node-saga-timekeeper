import * as CommonUtils from './common';

describe('Utils/common', () => {
  describe('isValidName', () => {
    test('empty name', () => {
      expect(CommonUtils.isValidName('')).toBe(false);
    });

    test('valid name', () => {
      expect(CommonUtils.isValidName('hello-FLOW_69')).toBe(true);
    });

    test('invalid name', () => {
      expect(CommonUtils.isValidName('hello-flow&*💩')).toBe(false);
    });

    test('too long name', () => {
      expect(
        CommonUtils.isValidName(
          'hello-flow_hello-flow_hello-flow_hello-flow_hello-flow_hello-flow_',
        ),
      ).toBe(false);
    });
  });
});
