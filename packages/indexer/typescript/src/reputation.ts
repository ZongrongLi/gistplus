/**
 * Reputation Tracker
 */

import { Receipt } from '@gistplus/core';
import { ProviderReputation } from './indexer';

export class ReputationTracker {
  private reputationData: Map<string, ReputationData> = new Map();
  
  recordReceipt(receipt: Receipt): void {
    const provider = receipt.providerPubkey;
    
    if (!this.reputationData.has(provider)) {
      this.reputationData.set(provider, {
        totalRequests: 0,
        slaMetCount: 0,
        totalLatency: 0,
        disputes: 0,
      });
    }
    
    const data = this.reputationData.get(provider)!;
    data.totalRequests++;
    data.totalLatency += receipt.latencyMs;
    
    if (receipt.slaVerification.met) {
      data.slaMetCount++;
    }
  }
  
  recordDispute(providerPubkey: string): void {
    const data = this.reputationData.get(providerPubkey);
    if (data) {
      data.disputes++;
    }
  }
  
  getReputation(providerPubkey: string): ProviderReputation {
    const data = this.reputationData.get(providerPubkey);
    
    if (!data || data.totalRequests === 0) {
      return {
        providerPubkey,
        score: 0,
        totalRequests: 0,
        slaComplianceRate: 0,
        averageLatency: 0,
        disputeRate: 0,
      };
    }
    
    const slaComplianceRate = data.slaMetCount / data.totalRequests;
    const averageLatency = data.totalLatency / data.totalRequests;
    const disputeRate = data.disputes / data.totalRequests;
    
    // Calculate score (0-100)
    let score = 100;
    score *= slaComplianceRate; // Reduce by SLA compliance
    score *= Math.max(0, 1 - disputeRate * 10); // Reduce by disputes
    score *= Math.max(0, 1 - averageLatency / 10000); // Reduce by latency
    
    return {
      providerPubkey,
      score: Math.round(score),
      totalRequests: data.totalRequests,
      slaComplianceRate,
      averageLatency,
      disputeRate,
    };
  }
}

interface ReputationData {
  totalRequests: number;
  slaMetCount: number;
  totalLatency: number;
  disputes: number;
}

