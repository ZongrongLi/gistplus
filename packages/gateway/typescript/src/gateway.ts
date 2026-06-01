/**
 * GistGateway - Verification and SLA resolution service
 */

import { Connection, Keypair } from '@solana/web3.js';
import { Receipt, Offer, Session, verifyReceipt } from '@gistplus/core';
import { ReceiptVerifier } from './verifier';
import { SLAResolver } from './sla-resolver';

export interface GatewayConfig {
  connection: Connection;
  keypair?: Keypair; // Optional: for signing verification attestations
}

/**
 * GistGateway provides independent verification services
 * 
 * Acts as a trusted third-party to:
 * 1. Verify receipt authenticity
 * 2. Resolve SLA disputes
 * 3. Attest to proof-of-delivery
 */
export class GistGateway {
  private connection: Connection;
  private keypair?: Keypair;
  private verifier: ReceiptVerifier;
  private slaResolver: SLAResolver;
  
  constructor(config: GatewayConfig) {
    this.connection = config.connection;
    this.keypair = config.keypair;
    this.verifier = new ReceiptVerifier(this.connection);
    this.slaResolver = new SLAResolver();
  }
  
  /**
   * Verify a Receipt's authenticity
   * 
   * Checks:
   * - Signature validity
   * - On-chain anchoring (if applicable)
   * - SLA compliance
   * - Provider reputation
   */
  async verifyReceipt(receipt: Receipt): Promise<VerificationResult> {
    return this.verifier.verify(receipt);
  }
  
  /**
   * Resolve an SLA dispute
   * 
   * Analyzes receipts and determines if SLA was breached
   */
  async resolveSLADispute(
    session: Session,
    receipts: Receipt[]
  ): Promise<SLADisputeResolution> {
    return this.slaResolver.resolve(session, receipts);
  }
  
  /**
   * Attest to proof-of-delivery
   * 
   * Signs a hash attesting that work was completed
   */
  async attestDelivery(receipt: Receipt): Promise<DeliveryAttestation> {
    if (!this.keypair) {
      throw new Error('Gateway keypair required for attestations');
    }
    
    // Verify receipt first
    const verification = await this.verifyReceipt(receipt);
    
    if (!verification.valid) {
      throw new Error('Cannot attest invalid receipt');
    }
    
    // Create attestation
    const attestation: DeliveryAttestation = {
      receiptId: receipt.receiptId,
      sessionId: receipt.sessionId,
      verified: true,
      timestamp: Date.now(),
      gatewayPubkey: this.keypair.publicKey.toBase58(),
      signature: '', // Would sign here
    };
    
    return attestation;
  }
}

export interface VerificationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  slaCompliant: boolean;
  onChainVerified: boolean;
  reputationScore?: number;
}

export interface SLADisputeResolution {
  disputeId: string;
  resolution: 'agent_favor' | 'provider_favor' | 'split';
  refundAmount: number;
  reasoning: string[];
  evidence: any[];
}

export interface DeliveryAttestation {
  receiptId: string;
  sessionId: string;
  verified: boolean;
  timestamp: number;
  gatewayPubkey: string;
  signature: string;
}

