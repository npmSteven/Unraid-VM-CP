import { describe, test, expect } from 'bun:test';
import { getCurrentTimestampInSeconds, hasTimestampExpired, parseTrustProxy } from '../src/index.js';

describe('shared-utils', () => {
  test('getCurrentTimestampInSeconds returns integer timestamp', () => {
    const ts = getCurrentTimestampInSeconds();
    expect(typeof ts).toBe('number');
    expect(ts).toBeGreaterThan(1700000000);
  });

  test('hasTimestampExpired checks expiration correctly', () => {
    const now = getCurrentTimestampInSeconds();
    expect(hasTimestampExpired(now - 100, 50)).toBe(true);
    expect(hasTimestampExpired(now - 10, 50)).toBe(false);
  });

  test('parseTrustProxy handles boolean, number, string values', () => {
    expect(parseTrustProxy('false')).toBe(false);
    expect(parseTrustProxy('true')).toBe(true);
    expect(parseTrustProxy('1')).toBe(1);
    expect(parseTrustProxy('loopback')).toBe('loopback');
    expect(parseTrustProxy(undefined)).toBe(false);
  });
});
