/**
 * Canonical Serialization and Hashing for Gist Plus
 * 
 * Provides deterministic JSON serialization and SHA-256 hashing
 * for cryptographic integrity of protocol objects.
 */

import { createHash } from 'crypto';

/**
 * Canonical JSON serialization
 * 
 * Sorts object keys recursively to ensure deterministic serialization
 * Required for cryptographic hashing and signature verification.
 * 
 * @param obj - Object to serialize
 * @returns Canonical JSON string
 */
export function canonicalStringify(obj: any): string {
  if (obj === null || obj === undefined) {
    return JSON.stringify(obj);
  }
  
  if (typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  
  if (Array.isArray(obj)) {
    return '[' + obj.map(item => canonicalStringify(item)).join(',') + ']';
  }
  
  // Sort keys alphabetically
  const sortedKeys = Object.keys(obj).sort();
  const pairs = sortedKeys.map(key => {
    const value = canonicalStringify(obj[key]);
    return `"${key}":${value}`;
  });
  
  return '{' + pairs.join(',') + '}';
}

/**
 * SHA-256 hash of an object
 * 
 * @param obj - Object to hash
 * @returns Hex-encoded SHA-256 hash
 */
export function hashObject(obj: any): string {
  const canonical = canonicalStringify(obj);
  return hashString(canonical);
}

/**
 * SHA-256 hash of a string
 * 
 * @param str - String to hash
 * @returns Hex-encoded SHA-256 hash
 */
export function hashString(str: string): string {
  return createHash('sha256').update(str, 'utf8').digest('hex');
}

/**
 * SHA-256 hash of bytes
 * 
 * @param bytes - Bytes to hash
 * @returns Hex-encoded SHA-256 hash
 */
export function hashBytes(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}

/**
 * Create a signable message from a protocol object
 * 
 * Excludes the 'signature' field if present, then creates canonical JSON
 * 
 * @param obj - Protocol object
 * @returns Uint8Array ready for signing
 */
export function createSignableMessage(obj: any): Uint8Array {
  // Remove signature field if present
  const { signature, ...objWithoutSignature } = obj;
  const canonical = canonicalStringify(objWithoutSignature);
  return Buffer.from(canonical, 'utf8');
}

/**
 * Verify that an object matches its hash
 * 
 * @param obj - Object to verify
 * @param expectedHash - Expected hash value
 * @returns true if hash matches
 */
export function verifyHash(obj: any, expectedHash: string): boolean {
  const actualHash = hashObject(obj);
  return actualHash === expectedHash;
}

