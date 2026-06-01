/**
 * Pricing Strategies for Gist Plus providers
 */

import { Intent, SupportedToken } from '@gistplus/core';

/**
 * PricingStrategy interface
 * 
 * Allows providers to implement dynamic pricing based on:
 * - Intent requirements
 * - Current load
 * - Token type
 * - Time of day
 * - Agent reputation
 */
export interface PricingStrategy {
  getPrice(intent: Intent): Promise<number> | number;
}

/**
 * Static pricing - same price for all requests
 */
export class StaticPricingStrategy implements PricingStrategy {
  constructor(
    private basePrice: number,
    private token: SupportedToken
  ) {}
  
  getPrice(intent: Intent): number {
    return this.basePrice;
  }
}

/**
 * Load-based pricing - price increases with load
 */
export class LoadBasedPricingStrategy implements PricingStrategy {
  constructor(
    private basePrice: number,
    private token: SupportedToken,
    private getLoadFactor: () => number // Returns 0-1, multiplies price
  ) {}
  
  getPrice(intent: Intent): number {
    const loadFactor = this.getLoadFactor();
    const multiplier = 1 + loadFactor;
    return this.basePrice * multiplier;
  }
}

/**
 * Time-based pricing - different prices for different times
 */
export class TimeBasedPricingStrategy implements PricingStrategy {
  constructor(
    private peakPrice: number,
    private offPeakPrice: number,
    private peakHours: { start: number; end: number }, // 0-23
    private token: SupportedToken
  ) {}
  
  getPrice(intent: Intent): number {
    const hour = new Date().getHours();
    const isPeak = hour >= this.peakHours.start && hour <= this.peakHours.end;
    return isPeak ? this.peakPrice : this.offPeakPrice;
  }
}

/**
 * SLA-based pricing - higher price for stricter SLAs
 */
export class SLABasedPricingStrategy implements PricingStrategy {
  constructor(
    private basePrice: number,
    private token: SupportedToken
  ) {}
  
  getPrice(intent: Intent): number {
    let price = this.basePrice;
    
    // Charge more for stricter latency requirements
    if (intent.sla?.maxLatencyMs) {
      if (intent.sla.maxLatencyMs < 1000) {
        price *= 1.5; // 50% premium for sub-second latency
      } else if (intent.sla.maxLatencyMs < 2000) {
        price *= 1.25; // 25% premium for sub-2s latency
      }
    }
    
    // Charge more for higher uptime guarantees
    if (intent.sla?.minUptimePercent && intent.sla.minUptimePercent > 99.5) {
      price *= 1.3; // 30% premium for 99.5%+ uptime
    }
    
    return price;
  }
}

/**
 * Custom pricing strategy - combine multiple strategies
 */
export class CompositePricingStrategy implements PricingStrategy {
  constructor(
    private strategies: PricingStrategy[]
  ) {}
  
  async getPrice(intent: Intent): Promise<number> {
    const prices = await Promise.all(
      this.strategies.map(strategy => strategy.getPrice(intent))
    );
    
    // Return average, max, or custom combination
    return Math.max(...prices);
  }
}

