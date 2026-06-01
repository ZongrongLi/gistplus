/**
 * Protocol Constants
 */

// Protocol version
export const PROTOCOL_VERSION = '0.1.0';
export const PROTOCOL_NAME = 'Gist Plus';

// HTTP Status Codes
export const HTTP_STATUS = {
  // Standard x402 status codes
  PAYMENT_REQUIRED: 402,
  QUOTE_REQUIRED: 402, // Same as payment required but triggers negotiation
  
  // Gist Plus specific status codes
  SESSION_STARTED: 201,
  RECEIPT_OK: 209,
  
  // Error codes
  INVALID_OFFER: 400,
  SIGNATURE_INVALID: 401,
  INSUFFICIENT_FUNDS: 402,
  SESSION_EXPIRED: 410,
  SLA_BREACH: 422,
} as const;

// HTTP Headers
export const HEADERS = {
  // Request headers
  INTENT: 'X-Gist-Intent',
  SESSION_ID: 'X-Gist-Session-Id',
  SIGNATURE: 'X-Gist-Signature',
  
  // Response headers
  OFFER: 'X-Gist-Offer',
  RECEIPT: 'X-Gist-Receipt',
  SLA_STATUS: 'X-Gist-SLA-Status',
} as const;

// Supported Tokens (Solana SPL tokens)
export const SUPPORTED_TOKENS = [
  'SOL',
  'USDC',
  'USDT',
  'BONK',
] as const;

export type SupportedToken = typeof SUPPORTED_TOKENS[number];

// Token mint addresses on Solana mainnet
export const TOKEN_MINTS: Record<SupportedToken, string> = {
  SOL: 'So11111111111111111111111111111111111111112', // Native SOL wrapped
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
};

// Session defaults
export const SESSION_DEFAULTS = {
  MAX_DURATION_MS: 3600000, // 1 hour
  MIN_DURATION_MS: 60000,   // 1 minute
  DEFAULT_DURATION_MS: 600000, // 10 minutes
} as const;

// SLA defaults
export const SLA_DEFAULTS = {
  MAX_LATENCY_MS: 5000,
  MIN_UPTIME_PERCENT: 99.0,
  MAX_ERROR_RATE_PERCENT: 1.0,
} as const;

// Offer expiration
export const OFFER_DEFAULTS = {
  EXPIRATION_MS: 60000, // 1 minute
  MAX_EXPIRATION_MS: 300000, // 5 minutes
} as const;

// Signature algorithm
export const SIGNATURE_ALGORITHM = 'ed25519';

// Canonical JSON for hashing
export const HASH_ALGORITHM = 'sha256';

