/**
 * Intent - Agent's expression of demand
 */

import { Intent, SLA } from './types';
import { PROTOCOL_VERSION, SupportedToken, SUPPORTED_TOKENS } from './constants';
import { InvalidIntentError } from './errors';
import { PublicKey } from '@solana/web3.js';
import { randomBytes } from 'crypto';

export interface CreateIntentParams {
  capability: string;
  maxPricePerRequest: number;
  token: SupportedToken;
  agentPubkey: string | PublicKey;
  maxSessionBudget?: number;
  sessionDurationMs?: number;
  sla?: SLA;
  metadata?: Record<string, any>;
}

/**
 * Create a new Intent
 * 
 * @param params - Intent parameters
 * @returns Intent object
 * @throws InvalidIntentError if parameters are invalid
 */
export function createIntent(params: CreateIntentParams): Intent {
  // Validate parameters
  validateIntentParams(params);
  
  // Generate unique intent ID
  const intentId = generateIntentId();
  
  // Convert public key to string
  const agentPubkey = typeof params.agentPubkey === 'string'
    ? params.agentPubkey
    : params.agentPubkey.toBase58();
  
  const intent: Intent = {
    version: PROTOCOL_VERSION,
    timestamp: Date.now(),
    intentId,
    capability: params.capability,
    maxPricePerRequest: params.maxPricePerRequest,
    token: params.token,
    agentPubkey,
    ...(params.maxSessionBudget && { maxSessionBudget: params.maxSessionBudget }),
    ...(params.sessionDurationMs && { sessionDurationMs: params.sessionDurationMs }),
    ...(params.sla && { sla: params.sla }),
    ...(params.metadata && { metadata: params.metadata }),
  };
  
  return intent;
}

/**
 * Validate Intent parameters
 * 
 * @throws InvalidIntentError if validation fails
 */
export function validateIntent(intent: Intent): void {
  if (!intent.intentId || typeof intent.intentId !== 'string') {
    throw new InvalidIntentError('Intent must have a valid intentId');
  }
  
  if (!intent.capability || typeof intent.capability !== 'string') {
    throw new InvalidIntentError('Intent must specify a capability');
  }
  
  if (typeof intent.maxPricePerRequest !== 'number' || intent.maxPricePerRequest <= 0) {
    throw new InvalidIntentError('maxPricePerRequest must be a positive number');
  }
  
  if (!SUPPORTED_TOKENS.includes(intent.token)) {
    throw new InvalidIntentError(`Unsupported token: ${intent.token}. Must be one of: ${SUPPORTED_TOKENS.join(', ')}`);
  }
  
  if (!intent.agentPubkey) {
    throw new InvalidIntentError('Intent must include agentPubkey');
  }
  
  // Validate public key format
  try {
    new PublicKey(intent.agentPubkey);
  } catch (error) {
    throw new InvalidIntentError(`Invalid agentPubkey: ${error}`);
  }
  
  // Validate session budget if provided
  if (intent.maxSessionBudget !== undefined) {
    if (typeof intent.maxSessionBudget !== 'number' || intent.maxSessionBudget <= 0) {
      throw new InvalidIntentError('maxSessionBudget must be a positive number');
    }
  }
  
  // Validate session duration if provided
  if (intent.sessionDurationMs !== undefined) {
    if (typeof intent.sessionDurationMs !== 'number' || intent.sessionDurationMs <= 0) {
      throw new InvalidIntentError('sessionDurationMs must be a positive number');
    }
  }
  
  // Validate SLA if provided
  if (intent.sla) {
    validateSLA(intent.sla);
  }
}

/**
 * Validate Intent creation parameters
 */
function validateIntentParams(params: CreateIntentParams): void {
  if (!params.capability) {
    throw new InvalidIntentError('Capability is required');
  }
  
  if (typeof params.maxPricePerRequest !== 'number' || params.maxPricePerRequest <= 0) {
    throw new InvalidIntentError('maxPricePerRequest must be a positive number');
  }
  
  if (!SUPPORTED_TOKENS.includes(params.token)) {
    throw new InvalidIntentError(`Unsupported token: ${params.token}`);
  }
  
  if (!params.agentPubkey) {
    throw new InvalidIntentError('agentPubkey is required');
  }
}

/**
 * Validate SLA parameters
 */
export function validateSLA(sla: SLA): void {
  if (sla.maxLatencyMs !== undefined) {
    if (typeof sla.maxLatencyMs !== 'number' || sla.maxLatencyMs <= 0) {
      throw new InvalidIntentError('SLA maxLatencyMs must be a positive number');
    }
  }
  
  if (sla.minUptimePercent !== undefined) {
    if (typeof sla.minUptimePercent !== 'number' || 
        sla.minUptimePercent < 0 || 
        sla.minUptimePercent > 100) {
      throw new InvalidIntentError('SLA minUptimePercent must be between 0 and 100');
    }
  }
  
  if (sla.maxErrorRatePercent !== undefined) {
    if (typeof sla.maxErrorRatePercent !== 'number' || 
        sla.maxErrorRatePercent < 0 || 
        sla.maxErrorRatePercent > 100) {
      throw new InvalidIntentError('SLA maxErrorRatePercent must be between 0 and 100');
    }
  }
}

/**
 * Generate a unique Intent ID
 */
function generateIntentId(): string {
  const timestamp = Date.now().toString(36);
  const random = randomBytes(8).toString('hex');
  return `intent_${timestamp}_${random}`;
}

