/**
 * GistIndexer - Main indexer for protocol data
 */

import { Connection } from '@solana/web3.js';
import { Receipt, Session, Offer } from '@gistplus/core';
import { ReputationTracker } from './reputation';
import { AnalyticsEngine } from './analytics';

export interface IndexerConfig {
  connection: Connection;
  startSlot?: number;
}

/**
 * GistIndexer aggregates protocol data for analytics and reputation
 */
export class GistIndexer {
  private connection: Connection;
  private reputation: ReputationTracker;
  private analytics: AnalyticsEngine;
  private receipts: Map<string, Receipt> = new Map();
  private sessions: Map<string, Session> = new Map();
  
  constructor(config: IndexerConfig) {
    this.connection = config.connection;
    this.reputation = new ReputationTracker();
    this.analytics = new AnalyticsEngine();
  }
  
  /**
   * Index a receipt
   */
  indexReceipt(receipt: Receipt): void {
    this.receipts.set(receipt.receiptId, receipt);
    this.reputation.recordReceipt(receipt);
    this.analytics.processReceipt(receipt);
  }
  
  /**
   * Index a session
   */
  indexSession(session: Session): void {
    this.sessions.set(session.sessionId, session);
    this.analytics.processSession(session);
  }
  
  /**
   * Get provider reputation score
   */
  getProviderReputation(providerPubkey: string): ProviderReputation {
    return this.reputation.getReputation(providerPubkey);
  }
  
  /**
   * Get market analytics
   */
  getMarketAnalytics(capability: string): MarketAnalytics {
    return this.analytics.getMarketData(capability);
  }
  
  /**
   * Get receipts for a session
   */
  getSessionReceipts(sessionId: string): Receipt[] {
    return Array.from(this.receipts.values())
      .filter(r => r.sessionId === sessionId);
  }
  
  /**
   * Get provider statistics
   */
  getProviderStats(providerPubkey: string): ProviderStats {
    const receipts = Array.from(this.receipts.values())
      .filter(r => r.providerPubkey === providerPubkey);
    
    const totalRequests = receipts.length;
    const successfulRequests = receipts.filter(r => r.slaVerification.met).length;
    const avgLatency = receipts.reduce((sum, r) => sum + r.latencyMs, 0) / totalRequests;
    
    return {
      providerPubkey,
      totalRequests,
      successfulRequests,
      successRate: successfulRequests / totalRequests,
      averageLatency: avgLatency,
      totalRevenue: receipts.reduce((sum, r) => sum + r.amountCharged, 0),
    };
  }
}

export interface ProviderReputation {
  providerPubkey: string;
  score: number; // 0-100
  totalRequests: number;
  slaComplianceRate: number;
  averageLatency: number;
  disputeRate: number;
}

export interface MarketAnalytics {
  capability: string;
  averagePrice: number;
  priceRange: { min: number; max: number };
  totalVolume: number;
  providerCount: number;
  averageSLA: {
    latency: number;
    uptime: number;
  };
}

export interface ProviderStats {
  providerPubkey: string;
  totalRequests: number;
  successfulRequests: number;
  successRate: number;
  averageLatency: number;
  totalRevenue: number;
}

