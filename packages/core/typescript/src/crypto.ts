/**
 * Cryptographic Utilities for Gist Plus
 * 
 * Handles Ed25519 signatures using Solana keypairs and TweetNaCl
 */

import * as nacl from 'tweetnacl';
import { PublicKey, Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import { InvalidSignatureError } from './errors';

/**
 * Sign a message with a Solana keypair
 * 
 * @param message - The message to sign (as Uint8Array)
 * @param keypair - Solana keypair
 * @returns Base58-encoded signature
 */
export function signMessage(message: Uint8Array, keypair: Keypair): string {
  const signature = nacl.sign.detached(message, keypair.secretKey);
  return bs58.encode(signature);
}

/**
 * Verify a signature against a message and public key
 * 
 * @param message - The message that was signed
 * @param signature - Base58-encoded signature
 * @param publicKey - Solana public key (as string or PublicKey)
 * @returns true if signature is valid
 * @throws InvalidSignatureError if signature is invalid
 */
export function verifySignature(
  message: Uint8Array,
  signature: string,
  publicKey: string | PublicKey
): boolean {
  try {
    const signatureBytes = bs58.decode(signature);
    const pubkeyObj = typeof publicKey === 'string' 
      ? new PublicKey(publicKey) 
      : publicKey;
    
    const isValid = nacl.sign.detached.verify(
      message,
      signatureBytes,
      pubkeyObj.toBytes()
    );
    
    if (!isValid) {
      throw new InvalidSignatureError('Signature verification failed');
    }
    
    return true;
  } catch (error) {
    if (error instanceof InvalidSignatureError) {
      throw error;
    }
    throw new InvalidSignatureError(`Failed to verify signature: ${error}`);
  }
}

/**
 * Convert a hex string to Uint8Array
 */
export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * Convert Uint8Array to hex string
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

