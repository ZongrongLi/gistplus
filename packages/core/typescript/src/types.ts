/**
 * Core Type Definitions for Gist Plus Protocol
 */

import { PublicKey } from '@solana/web3.js';
import { SupportedToken } from './constants';

/**
 * Base interface for all protocol objects
 */
export interface X402Object {
  version: string;
  timestamp: number;
}

/**
 * SLA (Service Level Agreement) Requirements
 */
export interface SLA {
  /** Maximum acceptable latency in milliseconds */
  maxLatencyMs?: number;
  
  /** Minimum uptime percentage (0-100) */
  minUptimePercent?: number;
  
  /** Maximum error rate percentage (0-100) */
  maxErrorRatePercent?: number;
  
  /** Additional custom SLA parameters */
  custom?: Record<string, any>;
}

/**
 * Intent - Agent's expression of demand
 * 
 * An Intent describes what the agent wants to purchase, including
 * price constraints, SLA requirements, and preferred payment token.
 */
export interface Intent extends X402Object {
  /** Unique identifier for this intent */
  intentId: string;
  
  /** The capability/service being requested (e.g., "gpt-4-inference", "image-generation") */
  capability: string;
  
  /** Maximum price willing to pay per request (in token units) */
  maxPricePerRequest: number;
  
  /** Preferred payment token */
  token: SupportedToken;
  
  /** Optional: Maximum total session budget */
  maxSessionBudget?: number;
  
  /** Optional: Desired session duration in milliseconds */
  sessionDurationMs?: number;
  
  /** SLA requirements */
  sla?: SLA;
  
  /** Agent's public key (Solana) */
  agentPubkey: string;
  
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Offer - Provider's signed quote response to an Intent
 * 
 * An Offer is the provider's binding commitment to provide service
 * at specified terms. It must be cryptographically signed.
 */
export interface Offer extends X402Object {
  /** Reference to the Intent this Offer responds to */
  intentId: string;
  
  /** Unique identifier for this offer */
  offerId: string;
  
  /** Provider's public key (Solana) */
  providerPubkey: string;
  
  /** Actual price per request */
  pricePerRequest: number;
  
  /** Payment token */
  token: SupportedToken;
  
  /** Token mint address on Solana */
  tokenMint: string;
  
  /** SLA guarantees provider commits to */
  sla: SLA;
  
  /** Session duration in milliseconds */
  sessionDurationMs: number;
  
  /** Offer expiration timestamp */
  expiresAt: number;
  
  /** Provider's endpoint for session creation */
  endpoint: string;
  
  /** Cryptographic signature of this offer */
  signature: string;
  
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Session - Prepaid channel between agent and provider
 * 
 * A Session represents an active, prepaid relationship where multiple
 * requests can be made under one payment with automatic refund logic.
 */
export interface Session extends X402Object {
  /** Unique session identifier */
  sessionId: string;
  
  /** Reference to the Offer this session is based on */
  offerId: string;
  
  /** Agent's public key */
  agentPubkey: string;
  
  /** Provider's public key */
  providerPubkey: string;
  
  /** Payment token */
  token: SupportedToken;
  
  /** Total amount deposited into session escrow */
  depositAmount: number;
  
  /** Remaining balance in session */
  remainingBalance: number;
  
  /** Price per request */
  pricePerRequest: number;
  
  /** Session start timestamp */
  startedAt: number;
  
  /** Session expiration timestamp */
  expiresAt: number;
  
  /** SLA terms for this session */
  sla: SLA;
  
  /** Current session state */
  state: SessionState;
  
  /** Solana transaction signature for session creation */
  creationTxSignature?: string;
  
  /** On-chain PDA address (if anchored) */
  pdaAddress?: string;
  
  /** Request count */
  requestCount: number;
  
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Session States
 */
export enum SessionState {
  PENDING = 'pending',
  ACTIVE = 'active',
  DEPLETED = 'depleted',
  EXPIRED = 'expired',
  REFUNDED = 'refunded',
  DISPUTED = 'disputed',
}

/**
 * Receipt - Verifiable proof of completed work
 * 
 * A Receipt is a cryptographically signed record of a completed request,
 * including input/output hashes, execution metrics, and SLA verification.
 */
export interface Receipt extends X402Object {
  /** Unique receipt identifier */
  receiptId: string;
  
  /** Session this receipt belongs to */
  sessionId: string;
  
  /** Request sequence number within session */
  requestNumber: number;
  
  /** SHA-256 hash of request input */
  inputHash: string;
  
  /** SHA-256 hash of response output */
  outputHash: string;
  
  /** Request start timestamp */
  requestStartedAt: number;
  
  /** Request completion timestamp */
  requestCompletedAt: number;
  
  /** Actual latency in milliseconds */
  latencyMs: number;
  
  /** Amount charged for this request */
  amountCharged: number;
  
  /** SLA verification result */
  slaVerification: SLAVerification;
  
  /** Provider's public key */
  providerPubkey: string;
  
  /** Provider's signature over this receipt */
  signature: string;
  
  /** Optional: On-chain PDA address (if anchored) */
  pdaAddress?: string;
  
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * SLA Verification Result
 */
export interface SLAVerification {
  /** Whether SLA was met */
  met: boolean;
  
  /** Individual SLA metric results */
  metrics: {
    latency?: { expected: number; actual: number; met: boolean };
    uptime?: { expected: number; actual: number; met: boolean };
    errorRate?: { expected: number; actual: number; met: boolean };
  };
  
  /** If SLA was breached, the refund amount */
  refundAmount?: number;
}

/**
 * Refund Claim
 */
export interface RefundClaim extends X402Object {
  /** Unique claim identifier */
  claimId: string;
  
  /** Session being refunded */
  sessionId: string;
  
  /** Agent requesting refund */
  agentPubkey: string;
  
  /** Provider responsible */
  providerPubkey: string;
  
  /** Reason for refund */
  reason: RefundReason;
  
  /** Requested refund amount */
  refundAmount: number;
  
  /** Supporting evidence (receipt IDs, logs, etc.) */
  evidence: string[];
  
  /** Claim state */
  state: RefundClaimState;
  
  /** Agent's signature */
  signature: string;
}

/**
 * Refund Reasons
 */
export enum RefundReason {
  SLA_BREACH = 'sla_breach',
  SERVICE_UNAVAILABLE = 'service_unavailable',
  INCORRECT_RESULT = 'incorrect_result',
  SESSION_TERMINATED_EARLY = 'session_terminated_early',
}

/**
 * Refund Claim States
 */
export enum RefundClaimState {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DISPUTED = 'disputed',
  SETTLED = 'settled',
}

