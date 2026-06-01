/**
 * @gistplus/client
 * 
 * Client SDK for AI agents and applications to interact with Gist Plus providers.
 * Handles Intent creation, Offer negotiation, Session management, and Receipt verification.
 */

export * from './client';
export * from './http-client';
export * from './session-manager';

// Re-export core types for convenience
export {
  Intent,
  Offer,
  Session,
  Receipt,
  SLA,
  SessionState,
  createIntent,
  verifyOffer,
  verifyReceipt,
  SUPPORTED_TOKENS,
  SupportedToken,
} from '@gistplus/core';

