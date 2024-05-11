import { expect, describe, it } from 'vitest';
import { makeRandomString } from '../../../src/constants/makerandomstring.constant';

describe('makeRandomString', () => {
  it('makeRandomString should return array of 11 number strings ', () => {
    const numStr = makeRandomString(11, 'numbers');
    expect(typeof numStr).toBe('string');
    expect(numStr.length).toBe(11);
    expect(/^\d+$/.test(numStr)).toBe(true);
  });

  it('makeRandomString should return array of 11 letter strings ', () => {
    const strStr = makeRandomString(11, 'letters');
    expect(typeof strStr).toBe('string');
    expect(strStr.length).toBe(11);
    expect(/^[a-zA-Z]+$/.test(strStr)).toBe(true);
  });

  it('makeRandomString should return array of 11 characters mixed with numbers and strings ', () => {
    const strMixed = makeRandomString(11, 'combined');
    expect(typeof strMixed).toBe('string');
    expect(strMixed.length).toBe(11);
    expect(/^[a-zA-Z0-9]+$/.test(strMixed)).toBe(true);
  });
});
