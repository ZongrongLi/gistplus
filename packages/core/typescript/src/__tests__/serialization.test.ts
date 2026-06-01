/**
 * Unit tests for serialization.ts
 */
import {
  canonicalStringify,
  hashObject,
  hashString,
  hashBytes,
  createSignableMessage,
  verifyHash,
} from '../serialization';

describe('canonicalStringify', () => {
  it('serializes a simple object with keys in sorted order', () => {
    const result = canonicalStringify({ b: 2, a: 1 });
    expect(result).toBe('{"a":1,"b":2}');
  });

  it('handles nested objects recursively', () => {
    const result = canonicalStringify({ b: { d: 4, c: 3 }, a: 1 });
    expect(result).toBe('{"a":1,"b":{"c":3,"d":4}}');
  });

  it('handles arrays', () => {
    const result = canonicalStringify({ items: [3, 1, 2] });
    expect(result).toBe('{"items":[3,1,2]}');
  });

  it('handles null and undefined', () => {
    expect(canonicalStringify(null)).toBe('null');
    // Canonical JSON serialization omits undefined: `undefined` → JSON.stringify gives undefined
    // This tests the function doesn't throw
    expect(() => canonicalStringify(undefined)).not.toThrow();
  });

  it('produces deterministic output for same logical content', () => {
    const obj1 = { b: 'x', a: 'y' };
    const obj2 = { a: 'y', b: 'x' };
    expect(canonicalStringify(obj1)).toBe(canonicalStringify(obj2));
  });

  it('handles string primitives', () => {
    expect(canonicalStringify('hello')).toBe('"hello"');
  });

  it('handles number primitives', () => {
    expect(canonicalStringify(42)).toBe('42');
  });

  it('handles boolean primitives', () => {
    expect(canonicalStringify(true)).toBe('true');
  });
});

describe('hashString', () => {
  it('produces a 64-char hex string', () => {
    const hash = hashString('hello world');
    expect(hash).toHaveLength(64);
    expect(/^[0-9a-f]+$/.test(hash)).toBe(true);
  });

  it('is deterministic', () => {
    expect(hashString('test')).toBe(hashString('test'));
  });

  it('produces different hashes for different inputs', () => {
    expect(hashString('a')).not.toBe(hashString('b'));
  });
});

describe('hashObject', () => {
  it('produces a 64-char hex string', () => {
    const hash = hashObject({ key: 'value' });
    expect(hash).toHaveLength(64);
  });

  it('is order-independent (canonical)', () => {
    const hash1 = hashObject({ b: 2, a: 1 });
    const hash2 = hashObject({ a: 1, b: 2 });
    expect(hash1).toBe(hash2);
  });
});

describe('hashBytes', () => {
  it('produces a 64-char hex string', () => {
    const bytes = new TextEncoder().encode('hello');
    const hash = hashBytes(bytes);
    expect(hash).toHaveLength(64);
  });

  it('matches hash of same content', () => {
    const bytes1 = new Uint8Array([1, 2, 3]);
    const bytes2 = new Uint8Array([1, 2, 3]);
    expect(hashBytes(bytes1)).toBe(hashBytes(bytes2));
  });
});

describe('createSignableMessage', () => {
  it('returns a Uint8Array', () => {
    const obj = { intentId: 'test', signature: 'sig123' };
    const result = createSignableMessage(obj);
    expect(result).toBeInstanceOf(Uint8Array);
  });

  it('excludes the signature field', () => {
    const obj = {
      intentId: 'test-123',
      price: 0.01,
      signature: 'fake-signature',
    };
    const result = createSignableMessage(obj);
    const text = new TextDecoder().decode(result);
    expect(text).not.toContain('signature');
    expect(text).toContain('test-123');
  });
});

describe('verifyHash', () => {
  it('returns true for matching hash', () => {
    const obj = { data: 'test' };
    const hash = hashObject(obj);
    expect(verifyHash(obj, hash)).toBe(true);
  });

  it('returns false for non-matching hash', () => {
    const obj = { data: 'test' };
    expect(verifyHash(obj, '0'.repeat(64))).toBe(false);
  });
});
