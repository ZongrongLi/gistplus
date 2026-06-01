/**
 * Unit tests for intent.ts
 */
import { Keypair } from '@solana/web3.js';
import { createIntent, validateIntent, validateSLA } from '../intent';
import { InvalidIntentError } from '../errors';
import { Intent } from '../types';

const keypair = Keypair.generate();

describe('validateSLA', () => {
  it('accepts a valid SLA with all fields', () => {
    expect(() =>
      validateSLA({
        maxLatencyMs: 2000,
        minUptimePercent: 99.5,
        maxErrorRatePercent: 1.0,
      })
    ).not.toThrow();
  });

  it('accepts SLA with partial fields', () => {
    expect(() => validateSLA({ maxLatencyMs: 500 })).not.toThrow();
  });

  it('accepts SLA with boundary values', () => {
    expect(() =>
      validateSLA({ minUptimePercent: 0, maxErrorRatePercent: 100 })
    ).not.toThrow();
  });

  it('rejects negative maxLatencyMs', () => {
    expect(() => validateSLA({ maxLatencyMs: -1 })).toThrow(InvalidIntentError);
  });

  it('rejects zero maxLatencyMs', () => {
    expect(() => validateSLA({ maxLatencyMs: 0 })).toThrow(InvalidIntentError);
  });

  it('rejects minUptimePercent below 0', () => {
    expect(() => validateSLA({ minUptimePercent: -1 })).toThrow(InvalidIntentError);
  });

  it('rejects minUptimePercent above 100', () => {
    expect(() => validateSLA({ minUptimePercent: 101 })).toThrow(InvalidIntentError);
  });

  it('rejects maxErrorRatePercent below 0', () => {
    expect(() => validateSLA({ maxErrorRatePercent: -0.1 })).toThrow(InvalidIntentError);
  });

  it('rejects maxErrorRatePercent above 100', () => {
    expect(() => validateSLA({ maxErrorRatePercent: 100.1 })).toThrow(InvalidIntentError);
  });
});

describe('createIntent', () => {
  const validParams = {
    capability: 'gpt-4-inference',
    maxPricePerRequest: 0.01,
    token: 'USDC' as const,
    agentPubkey: keypair.publicKey.toBase58(),
  };

  it('creates a valid intent with required fields only', () => {
    const intent = createIntent(validParams);
    expect(intent.intentId).toMatch(/^intent_/);
    expect(intent.capability).toBe(validParams.capability);
    expect(intent.maxPricePerRequest).toBe(validParams.maxPricePerRequest);
    expect(intent.token).toBe(validParams.token);
    expect(intent.agentPubkey).toBe(validParams.agentPubkey);
    expect(intent.version).toBe('0.1.0');
    expect(intent.timestamp).toBeDefined();
  });

  it('creates intent with a PublicKey object', () => {
    const intent = createIntent({
      ...validParams,
      agentPubkey: keypair.publicKey,
    });
    expect(intent.agentPubkey).toBe(keypair.publicKey.toBase58());
  });

  it('creates intent with optional fields', () => {
    const intent = createIntent({
      ...validParams,
      maxSessionBudget: 10,
      sessionDurationMs: 300000,
      sla: { maxLatencyMs: 2000 },
      metadata: { priority: 'high' },
    });
    expect(intent.maxSessionBudget).toBe(10);
    expect(intent.sessionDurationMs).toBe(300000);
    expect(intent.sla?.maxLatencyMs).toBe(2000);
    expect(intent.metadata?.priority).toBe('high');
  });

  it('creates intent with SOL token', () => {
    const intent = createIntent({
      ...validParams,
      token: 'SOL',
    });
    expect(intent.token).toBe('SOL');
  });

  it('creates intent with BONK token', () => {
    const intent = createIntent({
      ...validParams,
      token: 'BONK',
    });
    expect(intent.token).toBe('BONK');
  });

  it('rejects missing capability', () => {
    expect(() =>
      createIntent({ ...validParams, capability: '' })
    ).toThrow(InvalidIntentError);
  });

  it('rejects negative maxPricePerRequest', () => {
    expect(() =>
      createIntent({ ...validParams, maxPricePerRequest: -1 })
    ).toThrow(InvalidIntentError);
  });

  it('rejects zero maxPricePerRequest', () => {
    expect(() =>
      createIntent({ ...validParams, maxPricePerRequest: 0 })
    ).toThrow(InvalidIntentError);
  });

  it('rejects unsupported token', () => {
    expect(() =>
      createIntent({ ...validParams, token: 'BTC' as any })
    ).toThrow(InvalidIntentError);
  });

  it('rejects missing agentPubkey', () => {
    expect(() =>
      createIntent({ ...validParams, agentPubkey: '' })
    ).toThrow(InvalidIntentError);
  });
});

describe('validateIntent', () => {
  const makeIntent = (overrides: Partial<Intent> = {}): Intent => ({
    version: '0.1.0',
    timestamp: Date.now(),
    intentId: 'intent_test_123',
    capability: 'gpt-4-inference',
    maxPricePerRequest: 0.01,
    token: 'USDC',
    agentPubkey: keypair.publicKey.toBase58(),
    ...overrides,
  });

  it('accepts a valid intent', () => {
    expect(() => validateIntent(makeIntent())).not.toThrow();
  });

  it('rejects intent with missing intentId', () => {
    expect(() => validateIntent(makeIntent({ intentId: '' }))).toThrow(InvalidIntentError);
  });

  it('rejects intent with missing capability', () => {
    expect(() => validateIntent(makeIntent({ capability: '' }))).toThrow(InvalidIntentError);
  });

  it('rejects intent with invalid maxPricePerRequest', () => {
    expect(() => validateIntent(makeIntent({ maxPricePerRequest: -0.01 }))).toThrow(InvalidIntentError);
  });

  it('rejects intent with unsupported token', () => {
    expect(() => validateIntent(makeIntent({ token: 'ETH' as any }))).toThrow(InvalidIntentError);
  });

  it('rejects intent with invalid agentPubkey', () => {
    expect(() => validateIntent(makeIntent({ agentPubkey: 'not-a-key' }))).toThrow(InvalidIntentError);
  });

  it('rejects intent with negative maxSessionBudget', () => {
    expect(() => validateIntent(makeIntent({ maxSessionBudget: -1 }))).toThrow(InvalidIntentError);
  });

  it('rejects intent with zero maxSessionBudget', () => {
    expect(() => validateIntent(makeIntent({ maxSessionBudget: 0 }))).toThrow(InvalidIntentError);
  });

  it('rejects intent with negative sessionDurationMs', () => {
    expect(() => validateIntent(makeIntent({ sessionDurationMs: -100 }))).toThrow(InvalidIntentError);
  });

  it('rejects intent with zero sessionDurationMs', () => {
    expect(() => validateIntent(makeIntent({ sessionDurationMs: 0 }))).toThrow(InvalidIntentError);
  });

  it('rejects intent with invalid SLA latency', () => {
    expect(() =>
      validateIntent(makeIntent({ sla: { maxLatencyMs: 0 } }))
    ).toThrow(InvalidIntentError);
  });
});
