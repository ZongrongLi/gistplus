/**
 * Analytics Engine
 */

import { Receipt, Session } from '@gistplus/core';
import { MarketAnalytics } from './indexer';

export class AnalyticsEngine {
  private receipts: Receipt[] = [];
  private sessions: Session[] = [];
  
  processReceipt(receipt: Receipt): void {
    this.receipts.push(receipt);
  }
  
  processSession(session: Session): void {
    this.sessions.push(session);
  }
  
  getMarketData(capability: string): MarketAnalytics {
    // Filter sessions by capability (would need capability metadata)
    const relevantSessions = this.sessions;
    
    if (relevantSessions.length === 0) {
      return {
        capability,
        averagePrice: 0,
        priceRange: { min: 0, max: 0 },
        totalVolume: 0,
        providerCount: 0,
        averageSLA: {
          latency: 0,
          uptime: 0,
        },
      };
    }
    
    // Calculate price statistics
    const prices = relevantSessions.map(s => s.pricePerRequest);
    const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const priceRange = {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
    
    // Calculate volume
    const totalVolume = this.receipts
      .reduce((sum, r) => sum + r.amountCharged, 0);
    
    // Count unique providers
    const uniqueProviders = new Set(
      relevantSessions.map(s => s.providerPubkey)
    );
    
    // Calculate average SLA
    const latencies = relevantSessions
      .map(s => s.sla.maxLatencyMs || 0)
      .filter(l => l > 0);
    const avgLatency = latencies.length > 0
      ? latencies.reduce((a, b) => a + b, 0) / latencies.length
      : 0;
    
    return {
      capability,
      averagePrice,
      priceRange,
      totalVolume,
      providerCount: uniqueProviders.size,
      averageSLA: {
        latency: avgLatency,
        uptime: 99.0, // Would calculate from actual data
      },
    };
  }
}

