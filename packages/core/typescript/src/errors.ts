/**
 * Gist Plus Error Classes
 */

export class X402Error extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'X402Error';
  }
}

export class InvalidIntentError extends X402Error {
  constructor(message: string) {
    super(message, 'INVALID_INTENT');
    this.name = 'InvalidIntentError';
  }
}

export class InvalidOfferError extends X402Error {
  constructor(message: string) {
    super(message, 'INVALID_OFFER');
    this.name = 'InvalidOfferError';
  }
}

export class InvalidSignatureError extends X402Error {
  constructor(message: string) {
    super(message, 'INVALID_SIGNATURE');
    this.name = 'InvalidSignatureError';
  }
}

export class SessionExpiredError extends X402Error {
  constructor(message: string) {
    super(message, 'SESSION_EXPIRED');
    this.name = 'SessionExpiredError';
  }
}

export class InsufficientFundsError extends X402Error {
  constructor(message: string) {
    super(message, 'INSUFFICIENT_FUNDS');
    this.name = 'InsufficientFundsError';
  }
}

export class SLABreachError extends X402Error {
  constructor(message: string, public slaViolation: any) {
    super(message, 'SLA_BREACH');
    this.name = 'SLABreachError';
  }
}

export class OfferExpiredError extends X402Error {
  constructor(message: string) {
    super(message, 'OFFER_EXPIRED');
    this.name = 'OfferExpiredError';
  }
}

