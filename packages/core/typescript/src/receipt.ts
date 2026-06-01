/**
 * Receipt - Verifiable proof of completed work
 */

import { Receipt, Session, SLAVerification } from './types';
import { PROTOCOL_VERSION } from './constants';
import { InvalidSignatureError, SLABreachError } from './errors';
import { Keypair } from '@solana/web3.js';
import { signMessage, verifySignature } from './crypto';
import { createSignableMessage, hashString } from './serialization';
import { randomBytes } from 'crypto';

export interface CreateReceiptParams {
  session: Session;
  requestNumber: number;
  inputData: any;
  outputData: any;
  requestStartedAt: number;
  requestCompletedAt: number;
  amountCharged: number;
  pdaAddress?: string;
  metadata?: Record<string, any>;
}

/**
 * Create a new Receipt for a completed request
 * 
 * @param params - Receipt parameters
 * @param keypair - Provider's keypair for signing
 * @returns Signed Receipt object
 */
export function createReceipt(
  params: CreateReceiptParams,
  keypair: Keypair
): Receipt {
  const latencyMs = params.requestCompletedAt - params.requestStartedAt;
  
  // Hash input and output
  const inputHash = hashString(JSON.stringify(params.inputData));
  const outputHash = hashString(JSON.stringify(params.outputData));
  
  // Verify SLA compliance
  const slaVerification = verifySLA(params.session, latencyMs);
  
  // Create unsigned receipt
  const unsignedReceipt: Omit<Receipt, 'signature'> = {
    version: PROTOCOL_VERSION,
    timestamp: params.requestCompletedAt,
    receiptId: generateReceiptId(),
    sessionId: params.session.sessionId,
    requestNumber: params.requestNumber,
    inputHash,
    outputHash,
    requestStartedAt: params.requestStartedAt,
    requestCompletedAt: params.requestCompletedAt,
    latencyMs,
    amountCharged: params.amountCharged,
    slaVerification,
    providerPubkey: params.session.providerPubkey,
    ...(params.pdaAddress && { pdaAddress: params.pdaAddress }),
    ...(params.metadata && { metadata: params.metadata }),
  };
  
  // Sign the receipt
  const message = createSignableMessage(unsignedReceipt);
  const signature = signMessage(message, keypair);
  
  const receipt: Receipt = {
    ...unsignedReceipt,
    signature,
  };
  
  return receipt;
}

/**
 * Verify a Receipt's signature
 * 
 * @param receipt - Receipt to verify
 * @throws InvalidSignatureError if signature is invalid
 */
export function verifyReceipt(receipt: Receipt): void {
  const message = createSignableMessage(receipt);
  verifySignature(message, receipt.signature, receipt.providerPubkey);
}

/**
 * Verify SLA compliance for a request
 * 
 * @param session - Session containing SLA terms
 * @param actualLatencyMs - Actual request latency
 * @returns SLA verification result
 */
export function verifySLA(
  session: Session,
  actualLatencyMs: number
): SLAVerification {
  const metrics: SLAVerification['metrics'] = {};
  let allMet = true;
  let refundAmount = 0;
  
  // Check latency SLA
  if (session.sla.maxLatencyMs !== undefined) {
    const latencyMet = actualLatencyMs <= session.sla.maxLatencyMs;
    metrics.latency = {
      expected: session.sla.maxLatencyMs,
      actual: actualLatencyMs,
      met: latencyMet,
    };
    
    if (!latencyMet) {
      allMet = false;
      // Calculate refund: partial refund for latency breach
      refundAmount += session.pricePerRequest * 0.5; // 50% refund for latency breach
    }
  }
  
  // Note: Uptime and error rate are tracked over multiple requests
  // These would be calculated by the indexer/aggregator
  
  return {
    met: allMet,
    metrics,
    ...(refundAmount > 0 && { refundAmount }),
  };
}

/**
 * Check if SLA was breached in a Receipt
 * 
 * @param receipt - Receipt to check
 * @returns true if SLA was breached
 */
export function wasSLABreached(receipt: Receipt): boolean {
  return !receipt.slaVerification.met;
}

/**
 * Calculate refund amount from a Receipt
 * 
 * @param receipt - Receipt to check
 * @returns Refund amount (0 if no breach)
 */
export function calculateRefundAmount(receipt: Receipt): number {
  return receipt.slaVerification.refundAmount || 0;
}

/**
 * Verify input/output hashes in a Receipt
 * 
 * @param receipt - Receipt to verify
 * @param inputData - Original input data
 * @param outputData - Original output data
 * @returns true if hashes match
 */
export function verifyReceiptHashes(
  receipt: Receipt,
  inputData: any,
  outputData: any
): boolean {
  const inputHash = hashString(JSON.stringify(inputData));
  const outputHash = hashString(JSON.stringify(outputData));
  
  return (
    receipt.inputHash === inputHash &&
    receipt.outputHash === outputHash
  );
}

/**
 * Generate a unique Receipt ID
 */
function generateReceiptId(): string {
  const timestamp = Date.now().toString(36);
  const random = randomBytes(8).toString('hex');
  return `receipt_${timestamp}_${random}`;
}

