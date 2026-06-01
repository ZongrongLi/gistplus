/**
 * Offer - Provider's signed quote response to an Intent
 */

import { Offer, Intent, SLA } from './types';
import { 
  PROTOCOL_VERSION, 
  SupportedToken, 
  TOKEN_MINTS, 
  OFFER_DEFAULTS 
} from './constants';
import { InvalidOfferError, OfferExpiredError } from './errors';
import { PublicKey, Keypair } from '@solana/web3.js';
import { signMessage, verifySignature } from './crypto';
import { createSignableMessage } from './serialization';
import { randomBytes } from 'crypto';

export interface CreateOfferParams {
  intent: Intent;
  providerPubkey: string | PublicKey;
  pricePerRequest: number;
  sla: SLA;
  sessionDurationMs: number;
  endpoint: string;
  expirationMs?: number;
  metadata?: Record<string, any>;
}

/**
 * Create a new Offer in response to an Intent
 * 
 * @param params - Offer parameters
 * @param keypair - Provider's keypair for signing
 * @returns Signed Offer object
 * @throws InvalidOfferError if parameters are invalid
 */
export function createOffer(
  params: CreateOfferParams,
  keypair: Keypair
): Offer {
  // Validate parameters
  validateOfferParams(params);
  
  const providerPubkey = typeof params.providerPubkey === 'string'
    ? params.providerPubkey
    : params.providerPubkey.toBase58();
  
  const expiresAt = Date.now() + (params.expirationMs || OFFER_DEFAULTS.EXPIRATION_MS);
  
  // Create unsigned offer
  const unsignedOffer: Omit<Offer, 'signature'> = {
    version: PROTOCOL_VERSION,
    timestamp: Date.now(),
    intentId: params.intent.intentId,
    offerId: generateOfferId(),
    providerPubkey,
    pricePerRequest: params.pricePerRequest,
    token: params.intent.token,
    tokenMint: TOKEN_MINTS[params.intent.token],
    sla: params.sla,
    sessionDurationMs: params.sessionDurationMs,
    expiresAt,
    endpoint: params.endpoint,
    ...(params.metadata && { metadata: params.metadata }),
  };
  
  // Sign the offer
  const message = createSignableMessage(unsignedOffer);
  const signature = signMessage(message, keypair);
  
  const offer: Offer = {
    ...unsignedOffer,
    signature,
  };
  
  return offer;
}

/**
 * Verify an Offer's signature and validity
 * 
 * @param offer - Offer to verify
 * @throws InvalidOfferError if offer is invalid
 * @throws OfferExpiredError if offer has expired
 */
export function verifyOffer(offer: Offer): void {
  // Check expiration
  if (Date.now() > offer.expiresAt) {
    throw new OfferExpiredError(`Offer ${offer.offerId} expired at ${new Date(offer.expiresAt).toISOString()}`);
  }
  
  // Validate structure
  validateOfferStructure(offer);
  
  // Verify signature
  const message = createSignableMessage(offer);
  try {
    verifySignature(message, offer.signature, offer.providerPubkey);
  } catch (error) {
    throw new InvalidOfferError(`Offer signature verification failed: ${error}`);
  }
}

/**
 * Check if an Offer is expired
 * 
 * @param offer - Offer to check
 * @returns true if expired
 */
export function isOfferExpired(offer: Offer): boolean {
  return Date.now() > offer.expiresAt;
}

/**
 * Check if an Offer matches an Intent's requirements
 * 
 * @param offer - Offer to validate
 * @param intent - Original Intent
 * @returns true if offer meets intent requirements
 */
export function doesOfferMatchIntent(offer: Offer, intent: Intent): boolean {
  // Check price
  if (offer.pricePerRequest > intent.maxPricePerRequest) {
    return false;
  }
  
  // Check token
  if (offer.token !== intent.token) {
    return false;
  }
  
  // Check SLA requirements if specified
  if (intent.sla) {
    if (intent.sla.maxLatencyMs && offer.sla.maxLatencyMs) {
      if (offer.sla.maxLatencyMs > intent.sla.maxLatencyMs) {
        return false;
      }
    }
    
    if (intent.sla.minUptimePercent && offer.sla.minUptimePercent) {
      if (offer.sla.minUptimePercent < intent.sla.minUptimePercent) {
        return false;
      }
    }
  }
  
  // Check session duration if specified
  if (intent.sessionDurationMs) {
    if (offer.sessionDurationMs < intent.sessionDurationMs) {
      return false;
    }
  }
  
  return true;
}

/**
 * Validate Offer creation parameters
 */
function validateOfferParams(params: CreateOfferParams): void {
  if (!params.intent) {
    throw new InvalidOfferError('Intent is required');
  }
  
  if (typeof params.pricePerRequest !== 'number' || params.pricePerRequest <= 0) {
    throw new InvalidOfferError('pricePerRequest must be a positive number');
  }
  
  if (!params.sla) {
    throw new InvalidOfferError('SLA is required');
  }
  
  if (typeof params.sessionDurationMs !== 'number' || params.sessionDurationMs <= 0) {
    throw new InvalidOfferError('sessionDurationMs must be a positive number');
  }
  
  if (!params.endpoint || typeof params.endpoint !== 'string') {
    throw new InvalidOfferError('endpoint is required');
  }
  
  // Validate endpoint is a valid URL
  try {
    new URL(params.endpoint);
  } catch (error) {
    throw new InvalidOfferError(`Invalid endpoint URL: ${params.endpoint}`);
  }
}

/**
 * Validate Offer structure
 */
function validateOfferStructure(offer: Offer): void {
  if (!offer.offerId) {
    throw new InvalidOfferError('Offer must have an offerId');
  }
  
  if (!offer.intentId) {
    throw new InvalidOfferError('Offer must reference an intentId');
  }
  
  if (!offer.providerPubkey) {
    throw new InvalidOfferError('Offer must have a providerPubkey');
  }
  
  if (!offer.signature) {
    throw new InvalidOfferError('Offer must be signed');
  }
  
  // Validate public key
  try {
    new PublicKey(offer.providerPubkey);
  } catch (error) {
    throw new InvalidOfferError(`Invalid providerPubkey: ${error}`);
  }
}

/**
 * Generate a unique Offer ID
 */
function generateOfferId(): string {
  const timestamp = Date.now().toString(36);
  const random = randomBytes(8).toString('hex');
  return `offer_${timestamp}_${random}`;
}

