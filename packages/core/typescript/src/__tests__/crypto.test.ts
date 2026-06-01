/**
 * Unit tests for crypto.ts
 */
import { Keypair } from '@solana/web3.js';
import { signMessage, verifySignature, hexToBytes, bytesToHex } from '../crypto';
import { InvalidSignatureError } from '../errors';

const keypair = Keypair.generate();
const otherKeypair = Keypair.generate();

describe('signMessage', () => {
  it('signs a message and returns a base58-encoded signature', () => {
    const message = new TextEncoder().encode('hello world');
    const signature = signMessage(message, keypair);
    expect(typeof signature).toBe('string');
    expect(signature.length).toBeGreaterThan(0);
  });

  it('produces deterministic-like signatures (not same due to nonce, but valid)', () => {
    const message = new TextEncoder().encode('test message');
    const sig1 = signMessage(message, keypair);
    const sig2 = signMessage(message, keypair);
    // Ed25519 is deterministic, so same key + message = same signature
    expect(sig1).toBe(sig2);
  });

  it('produces different signatures for different messages', () => {
    const msg1 = new TextEncoder().encode('message one');
    const msg2 = new TextEncoder().encode('message two');
    expect(signMessage(msg1, keypair)).not.toBe(signMessage(msg2, keypair));
  });
});

describe('verifySignature', () => {
  it('verifies a valid signature with string public key', () => {
    const message = new TextEncoder().encode('verify this');
    const signature = signMessage(message, keypair);
    const result = verifySignature(message, signature, keypair.publicKey.toBase58());
    expect(result).toBe(true);
  });

  it('verifies a valid signature with PublicKey object', () => {
    const message = new TextEncoder().encode('verify this too');
    const signature = signMessage(message, keypair);
    const result = verifySignature(message, signature, keypair.publicKey);
    expect(result).toBe(true);
  });

  it('rejects a tampered message', () => {
    const originalMessage = new TextEncoder().encode('original');
    const tamperedMessage = new TextEncoder().encode('tampered');
    const signature = signMessage(originalMessage, keypair);
    expect(() => verifySignature(tamperedMessage, signature, keypair.publicKey))
      .toThrow(InvalidSignatureError);
  });

  it('rejects a signature from a different key', () => {
    const message = new TextEncoder().encode('test');
    const signature = signMessage(message, otherKeypair);
    expect(() => verifySignature(message, signature, keypair.publicKey))
      .toThrow(InvalidSignatureError);
  });

  it('rejects an invalid signature string', () => {
    const message = new TextEncoder().encode('test');
    expect(() => verifySignature(message, 'invalid', keypair.publicKey))
      .toThrow(InvalidSignatureError);
  });

  it('rejects an empty signature', () => {
    const message = new TextEncoder().encode('test');
    expect(() => verifySignature(message, '', keypair.publicKey))
      .toThrow(InvalidSignatureError);
  });

  it('round-trips: sign then verify', () => {
    for (const msg of ['hello', 'gist plus', 'solana protocol', '']) {
      const message = new TextEncoder().encode(msg);
      const sig = signMessage(message, keypair);
      expect(verifySignature(message, sig, keypair.publicKey)).toBe(true);
    }
  });
});

describe('hexToBytes', () => {
  it('converts a hex string to Uint8Array', () => {
    const result = hexToBytes('deadbeef');
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(4);
    expect(result[0]).toBe(0xde);
    expect(result[1]).toBe(0xad);
    expect(result[2]).toBe(0xbe);
    expect(result[3]).toBe(0xef);
  });

  it('converts empty string to empty array', () => {
    const result = hexToBytes('');
    expect(result.length).toBe(0);
  });

  it('handles all zeros', () => {
    const result = hexToBytes('00000000');
    expect([...result]).toEqual([0, 0, 0, 0]);
  });
});

describe('bytesToHex', () => {
  it('converts Uint8Array to hex string', () => {
    const bytes = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
    expect(bytesToHex(bytes)).toBe('deadbeef');
  });

  it('handles values that need padding', () => {
    const bytes = new Uint8Array([0x0a, 0x01, 0xff]);
    expect(bytesToHex(bytes)).toBe('0a01ff');
  });

  it('converts empty array to empty string', () => {
    const bytes = new Uint8Array(0);
    expect(bytesToHex(bytes)).toBe('');
  });

  it('round-trips with hexToBytes', () => {
    const original = 'abcdef0123456789';
    expect(bytesToHex(hexToBytes(original))).toBe(original);
  });
});
