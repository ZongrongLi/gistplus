/**
 * Receipt Verifier
 */

import { Connection } from '@solana/web3.js';
import { Receipt, verifyReceipt } from '@gistplus/core';
import { VerificationResult } from './gateway';

export class ReceiptVerifier {
  constructor(private connection: Connection) {}
  
  async verify(receipt: Receipt): Promise<VerificationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let valid = true;
    
    // 1. Verify signature
    try {
      verifyReceipt(receipt);
    } catch (error) {
      errors.push(`Signature verification failed: ${error}`);
      valid = false;
    }
    
    // 2. Check SLA compliance
    const slaCompliant = receipt.slaVerification.met;
    if (!slaCompliant) {
      warnings.push('SLA was not met for this request');
    }
    
    // 3. Verify on-chain (if PDA exists)
    let onChainVerified = false;
    if (receipt.pdaAddress) {
      try {
        const accountInfo = await this.connection.getAccountInfo(
          new (await import('@solana/web3.js')).PublicKey(receipt.pdaAddress)
        );
        onChainVerified = accountInfo !== null;
        
        if (!onChainVerified) {
          warnings.push('Receipt claims on-chain anchor but PDA not found');
        }
      } catch (error) {
        warnings.push(`On-chain verification failed: ${error}`);
      }
    }
    
    // 4. Validate timestamps
    if (receipt.requestCompletedAt < receipt.requestStartedAt) {
      errors.push('Completion timestamp before start timestamp');
      valid = false;
    }
    
    // 5. Validate latency calculation
    const calculatedLatency = receipt.requestCompletedAt - receipt.requestStartedAt;
    if (Math.abs(calculatedLatency - receipt.latencyMs) > 100) {
      warnings.push('Latency calculation may be inaccurate');
    }
    
    return {
      valid,
      errors,
      warnings,
      slaCompliant,
      onChainVerified,
    };
  }
}

