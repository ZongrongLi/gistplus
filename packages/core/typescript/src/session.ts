/**
 * Session - Prepaid channel between agent and provider
 */

import { Session, Offer, SessionState } from './types';
import { PROTOCOL_VERSION } from './constants';
import { SessionExpiredError, InsufficientFundsError } from './errors';
import { randomBytes } from 'crypto';

export interface CreateSessionParams {
  offer: Offer;
  agentPubkey: string;
  depositAmount: number;
  creationTxSignature?: string;
  pdaAddress?: string;
}

/**
 * Create a new Session from an accepted Offer
 * 
 * @param params - Session parameters
 * @returns Session object
 */
export function createSession(params: CreateSessionParams): Session {
  const startedAt = Date.now();
  const expiresAt = startedAt + params.offer.sessionDurationMs;
  
  const session: Session = {
    version: PROTOCOL_VERSION,
    timestamp: startedAt,
    sessionId: generateSessionId(),
    offerId: params.offer.offerId,
    agentPubkey: params.agentPubkey,
    providerPubkey: params.offer.providerPubkey,
    token: params.offer.token,
    depositAmount: params.depositAmount,
    remainingBalance: params.depositAmount,
    pricePerRequest: params.offer.pricePerRequest,
    startedAt,
    expiresAt,
    sla: params.offer.sla,
    state: SessionState.ACTIVE,
    requestCount: 0,
    ...(params.creationTxSignature && { creationTxSignature: params.creationTxSignature }),
    ...(params.pdaAddress && { pdaAddress: params.pdaAddress }),
  };
  
  return session;
}

/**
 * Check if a Session is active
 * 
 * @param session - Session to check
 * @returns true if session is active
 */
export function isSessionActive(session: Session): boolean {
  if (session.state !== SessionState.ACTIVE) {
    return false;
  }
  
  if (Date.now() > session.expiresAt) {
    return false;
  }
  
  if (session.remainingBalance < session.pricePerRequest) {
    return false;
  }
  
  return true;
}

/**
 * Check if a Session has expired
 * 
 * @param session - Session to check
 * @returns true if expired
 */
export function isSessionExpired(session: Session): boolean {
  return Date.now() > session.expiresAt;
}

/**
 * Deduct payment from a Session
 * 
 * @param session - Session to deduct from
 * @param amount - Amount to deduct
 * @returns Updated session
 * @throws InsufficientFundsError if balance is insufficient
 */
export function deductFromSession(session: Session, amount: number): Session {
  if (session.remainingBalance < amount) {
    throw new InsufficientFundsError(
      `Insufficient balance: ${session.remainingBalance} < ${amount}`
    );
  }
  
  const updatedSession: Session = {
    ...session,
    remainingBalance: session.remainingBalance - amount,
    requestCount: session.requestCount + 1,
  };
  
  // Update state if depleted
  if (updatedSession.remainingBalance < updatedSession.pricePerRequest) {
    updatedSession.state = SessionState.DEPLETED;
  }
  
  return updatedSession;
}

/**
 * Refund amount to a Session
 * 
 * @param session - Session to refund to
 * @param amount - Amount to refund
 * @returns Updated session
 */
export function refundToSession(session: Session, amount: number): Session {
  return {
    ...session,
    remainingBalance: Math.min(
      session.remainingBalance + amount,
      session.depositAmount
    ),
  };
}

/**
 * Mark a Session as expired
 * 
 * @param session - Session to expire
 * @returns Updated session
 */
export function expireSession(session: Session): Session {
  return {
    ...session,
    state: SessionState.EXPIRED,
  };
}

/**
 * Mark a Session as refunded
 * 
 * @param session - Session to refund
 * @returns Updated session
 */
export function markSessionRefunded(session: Session): Session {
  return {
    ...session,
    state: SessionState.REFUNDED,
  };
}

/**
 * Calculate remaining requests a Session can support
 * 
 * @param session - Session to check
 * @returns Number of requests remaining
 */
export function calculateRemainingRequests(session: Session): number {
  return Math.floor(session.remainingBalance / session.pricePerRequest);
}

/**
 * Validate Session for a new request
 * 
 * @param session - Session to validate
 * @throws SessionExpiredError if session is expired
 * @throws InsufficientFundsError if balance is insufficient
 */
export function validateSessionForRequest(session: Session): void {
  if (isSessionExpired(session)) {
    throw new SessionExpiredError(
      `Session ${session.sessionId} expired at ${new Date(session.expiresAt).toISOString()}`
    );
  }
  
  if (session.remainingBalance < session.pricePerRequest) {
    throw new InsufficientFundsError(
      `Session ${session.sessionId} has insufficient balance`
    );
  }
  
  if (session.state !== SessionState.ACTIVE) {
    throw new SessionExpiredError(
      `Session ${session.sessionId} is not active (state: ${session.state})`
    );
  }
}

/**
 * Generate a unique Session ID
 */
function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const random = randomBytes(8).toString('hex');
  return `session_${timestamp}_${random}`;
}

