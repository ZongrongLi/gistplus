/**
 * SLA Dispute Resolver
 */

import { Session, Receipt } from '@gistplus/core';
import { SLADisputeResolution } from './gateway';

export class SLAResolver {
  /**
   * Resolve an SLA dispute based on receipts
   */
  resolve(session: Session, receipts: Receipt[]): SLADisputeResolution {
    const reasoning: string[] = [];
    const evidence: any[] = [];
    
    // Analyze receipts
    const totalRequests = receipts.length;
    const slaBreach = receipts.filter(r => !r.slaVerification.met);
    const breachRate = slaBreach.length / totalRequests;
    
    reasoning.push(`Total requests: ${totalRequests}`);
    reasoning.push(`SLA breaches: ${slaBreach.length} (${(breachRate * 100).toFixed(2)}%)`);
    
    // Calculate average latency
    const avgLatency = receipts.reduce((sum, r) => sum + r.latencyMs, 0) / totalRequests;
    reasoning.push(`Average latency: ${avgLatency.toFixed(0)}ms`);
    reasoning.push(`SLA requirement: ${session.sla.maxLatencyMs}ms`);
    
    // Determine resolution
    let resolution: 'agent_favor' | 'provider_favor' | 'split';
    let refundAmount = 0;
    
    if (breachRate > 0.5) {
      // More than 50% breaches = full refund to agent
      resolution = 'agent_favor';
      refundAmount = session.depositAmount;
      reasoning.push('Major SLA breach (>50%) - full refund to agent');
    } else if (breachRate > 0.1) {
      // 10-50% breaches = partial refund
      resolution = 'split';
      refundAmount = slaBreach.reduce((sum, r) => {
        return sum + (r.slaVerification.refundAmount || r.amountCharged);
      }, 0);
      reasoning.push('Moderate SLA breach - partial refund based on breached requests');
    } else {
      // Less than 10% = provider favor
      resolution = 'provider_favor';
      refundAmount = slaBreach.reduce((sum, r) => {
        return sum + (r.slaVerification.refundAmount || 0);
      }, 0);
      reasoning.push('Minor SLA breach (<10%) - minimal refund');
    }
    
    // Add evidence
    evidence.push({
      totalRequests,
      breachedRequests: slaBreach.length,
      breachRate,
      avgLatency,
      slaRequirement: session.sla,
    });
    
    return {
      disputeId: `dispute_${session.sessionId}_${Date.now()}`,
      resolution,
      refundAmount,
      reasoning,
      evidence,
    };
  }
}

