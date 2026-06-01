/**
 * Unit tests for errors.ts
 */
import {
  X402Error,
  InvalidIntentError,
  InvalidOfferError,
  InvalidSignatureError,
  SessionExpiredError,
  InsufficientFundsError,
  SLABreachError,
  OfferExpiredError,
} from '../errors';

describe('X402Error', () => {
  it('creates with message and code', () => {
    const err = new X402Error('test', 'TEST_CODE');
    expect(err.message).toBe('test');
    expect(err.code).toBe('TEST_CODE');
    expect(err.name).toBe('X402Error');
    expect(err).toBeInstanceOf(Error);
  });
});

describe('InvalidIntentError', () => {
  it('has correct code and name', () => {
    const err = new InvalidIntentError('bad intent');
    expect(err.code).toBe('INVALID_INTENT');
    expect(err.name).toBe('InvalidIntentError');
    expect(err).toBeInstanceOf(X402Error);
  });
});

describe('InvalidOfferError', () => {
  it('has correct code and name', () => {
    const err = new InvalidOfferError('bad offer');
    expect(err.code).toBe('INVALID_OFFER');
    expect(err.name).toBe('InvalidOfferError');
  });
});

describe('InvalidSignatureError', () => {
  it('has correct code and name', () => {
    const err = new InvalidSignatureError('bad sig');
    expect(err.code).toBe('INVALID_SIGNATURE');
    expect(err.name).toBe('InvalidSignatureError');
  });
});

describe('SessionExpiredError', () => {
  it('has correct code and name', () => {
    const err = new SessionExpiredError('session gone');
    expect(err.code).toBe('SESSION_EXPIRED');
    expect(err.name).toBe('SessionExpiredError');
  });
});

describe('InsufficientFundsError', () => {
  it('has correct code and name', () => {
    const err = new InsufficientFundsError('no funds');
    expect(err.code).toBe('INSUFFICIENT_FUNDS');
    expect(err.name).toBe('InsufficientFundsError');
  });
});

describe('SLABreachError', () => {
  it('has correct code, name, and stores violation', () => {
    const violation = { latency: { expected: 1000, actual: 5000 } };
    const err = new SLABreachError('sla fail', violation);
    expect(err.code).toBe('SLA_BREACH');
    expect(err.name).toBe('SLABreachError');
    expect(err.slaViolation).toBe(violation);
  });
});

describe('OfferExpiredError', () => {
  it('has correct code and name', () => {
    const err = new OfferExpiredError('too late');
    expect(err.code).toBe('OFFER_EXPIRED');
    expect(err.name).toBe('OfferExpiredError');
  });
});
